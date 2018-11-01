import React, { Component } from "react";
import { formatPrice } from "../helpers";

class Order extends Component {
  renderOrder = key => {
    const fish = this.props.fishes[key];
    const count = this.props.order[key];

    if (!fish) return null;

    const isAvaialble = fish.status === "available";

    if (!isAvaialble) {
      return <li>Sorry {fish ? fish.name : "fish"} is no longer avaialble</li>;
    }
    return (
      <li key={key}>
        {count} lbs {fish.name}
        {formatPrice(count * fish.price)}
        <button onClick={() => this.props.removeFromOrder(key)}>&times;</button>
      </li>
    );
  };

  render() {
    const orderIds = Object.keys(this.props.order);
    const total = orderIds.reduce((prevTotal, key) => {
      const fish = this.props.fishes[key];
      if (!fish) return null;

      const count = this.props.order[key];

      const isAvailable = fish.status === "available";

      if (isAvailable) {
        return prevTotal + count * fish.price;
      }
      return prevTotal;
    }, 0);
    return (
      <div className="order-wrap">
        <h2>Order</h2>
        <ul className="order">{orderIds.map(this.renderOrder)}</ul>
        <div className="total">
          <strong> {formatPrice(total)}</strong>
        </div>
      </div>
    );
  }
}

export default Order;
