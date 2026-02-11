<script lang="ts">
  import { Chart, BarController, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';

  Chart.register(BarController, CategoryScale, LinearScale, BarElement, Tooltip);

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
    const gridColor = dark ? '#3a3a3c' : '#e8e8ed';

    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets[0].data = values;
      chart.data.datasets[0].backgroundColor = bgColors;
      chart.update();
      return;
    }

    if (!canvas) return;

    chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: bgColors,
            borderRadius: 4,
            barPercentage: 0.7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => `${(ctx.raw as number).toFixed(1)}h`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: textColor, font: { size: 10 }, maxRotation: 45, minRotation: 45 },
            grid: { display: false },
          },
          y: {
            ticks: { color: textColor, font: { size: 10 }, callback: (v) => `${v}h` },
            grid: { color: gridColor },
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
