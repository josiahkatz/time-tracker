import EventKit
import Foundation

// Reads today's calendar events via EventKit and outputs JSON.
// Usage: calendar-helper <YYYY-MM-DD> [output-file-path]
// If output-file-path is given, writes JSON there. Otherwise writes to stdout.

let store = EKEventStore()
let semaphore = DispatchSemaphore(value: 0)

let formatter = ISO8601DateFormatter()
formatter.formatOptions = [.withInternetDateTime]

func writeResult(_ obj: Any) {
    let json: String
    if let data = try? JSONSerialization.data(withJSONObject: obj, options: []),
       let str = String(data: data, encoding: .utf8) {
        json = str
    } else {
        json = "{\"status\":\"error\",\"events\":[],\"message\":\"JSON encoding failed\"}"
    }

    if CommandLine.arguments.count > 2 {
        let outputPath = CommandLine.arguments[2]
        try? json.write(toFile: outputPath, atomically: true, encoding: .utf8)
    } else {
        print(json)
    }
}

store.requestFullAccessToEvents { granted, error in
    defer { semaphore.signal() }

    guard granted else {
        let errMsg = error?.localizedDescription ?? "Calendar access not granted"
        writeResult(["status": "no-permission", "events": [], "message": errMsg] as [String: Any])
        return
    }

    let cal = Calendar.current
    var dateComponents = cal.dateComponents([.year, .month, .day], from: Date())

    if CommandLine.arguments.count > 1 {
        let parts = CommandLine.arguments[1].split(separator: "-")
        if parts.count == 3, let y = Int(parts[0]), let m = Int(parts[1]), let d = Int(parts[2]) {
            dateComponents.year = y
            dateComponents.month = m
            dateComponents.day = d
        }
    }

    guard let startOfDay = cal.date(from: dateComponents),
          let endOfDay = cal.date(byAdding: .day, value: 1, to: startOfDay) else {
        writeResult(["status": "error", "events": [], "message": "Could not compute date range"])
        return
    }

    let predicate = store.predicateForEvents(withStart: startOfDay, end: endOfDay, calendars: nil)
    let events = store.events(matching: predicate)

    var output: [[String: Any]] = []
    for event in events {
        let duration = Int(event.endDate.timeIntervalSince(event.startDate) / 60)
        if event.isAllDay || duration >= 1440 { continue }

        output.append([
            "title": event.title ?? "(No title)",
            "startDate": formatter.string(from: event.startDate),
            "endDate": formatter.string(from: event.endDate),
            "calendar": event.calendar.title,
            "durationMinutes": duration
        ])
    }

    output.sort { ($0["startDate"] as? String ?? "") < ($1["startDate"] as? String ?? "") }

    writeResult(["status": "ok", "events": output])
}

semaphore.wait()
