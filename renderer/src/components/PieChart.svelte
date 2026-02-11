<script lang="ts">
  import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

  Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

  let { data, colors }: { data: Record<string, number>; colors: Record<string, string> } = $props();

  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;

  function isDark(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  $effect(() => {
    const labels = Object.keys(data);
    const values = Object.values(data);
    const bgColors = labels.map((l) => colors[l] || '#6b7280');
    const dark = isDark();
    const textColor = dark ? '#aeaeb2' : '#6e6e73';

    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets[0].data = values;
      chart.data.datasets[0].backgroundColor = bgColors;
      chart.update();
      return;
    }

    if (!canvas) return;

    chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: bgColors,
            borderWidth: 0,
            spacing: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: textColor,
              font: { size: 10 },
              boxWidth: 10,
              boxHeight: 10,
              padding: 6,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.raw as number;
                const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((val / total) * 100).toFixed(0) : '0';
                return `${ctx.label}: ${val.toFixed(1)}h (${pct}%)`;
              },
            },
          },
        },
      },
    });
  });
</script>

<div class="chart-container">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .chart-container {
    position: relative;
    height: 160px;
  }
</style>
