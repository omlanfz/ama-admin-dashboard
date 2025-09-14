import Card from "../components/Card";

export default function Statistics() {
  const stats = [
    { label: "Total Orders", value: 120 },
    { label: "Revenue This Month", value: "$2,400" },
    { label: "New Customers", value: 35 },
    { label: "Repeat Customers", value: "65%" },
  ];

  return (
    <div className="statistics-grid">
      {stats.map((stat, index) => (
        <Card key={index} title={stat.label}>
          <p className="statistics-metric">{stat.value}</p>
        </Card>
      ))}
    </div>
  );
}