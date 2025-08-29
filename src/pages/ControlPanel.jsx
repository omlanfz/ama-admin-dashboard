import { useState } from "react";
import Card from "../components/Card";

export default function ControlPanel() {
  const [price, setPrice] = useState(12.5);
  const [discount, setDiscount] = useState(10);

  return (
    <Card title="Service Pricing">
      <div className="grid gap-4">
        <div>
          <label className="block font-medium">Base Price ($)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label className="block font-medium">Discount (%)</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value))}
          />
        </div>
        <p className="sub">
          Final Price: ${(price * (1 - discount / 100)).toFixed(2)}
        </p>
      </div>
    </Card>
  );
}
