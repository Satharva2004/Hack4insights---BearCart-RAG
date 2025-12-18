import { Done } from "@mui/icons-material";
import order_item_refunds from "../../public/data/order_item_refunds.json";

export const modify_data = () => {
  const modifiedData = order_item_refunds.map((item) => {
    const [date, time] = item.created_at.split(" ");

    return {
      ...item,
      created_at_date: date,
      created_at_time: time,
    };
  });
  console.log('done');
  console.log(modifiedData);
  return modifiedData;
};
