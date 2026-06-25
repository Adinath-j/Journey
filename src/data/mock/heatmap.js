export const heatmapMonths = [
  { label: "Apr", start: 0, span: 5 },
  { label: "May", start: 5, span: 5 },
  { label: "Jun", start: 10, span: 5 },
];

export const heatmapDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const heatmapValues = Array.from({ length: 7 }, (_, row) =>
  Array.from({ length: 15 }, (_, column) => {
    const value = ((column * 7 + row * 5 + column * row) % 11) - 3;
    return value <= 0 ? 0 : Math.min(4, Math.ceil(value / 2));
  }),
);
