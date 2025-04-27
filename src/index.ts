import mongoose from "mongoose";
import app from "./app";

const port = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// variants: [
//   {
//     name: "Black/White",
//     sku: "NIKE-AM270-BW",
//     basePrice: 150.0,
//     combination: {
//       id: "black-white",
//       isActive: true,
//       isDefault: true,
//     },
//     options: [
//       {
//         name: "color",
//         value: "black",
//         type: "color",
//         displayName: "Black",
//         hexCode: "#000000",
//       },
//       {
//         name: "size",
//         value: "10",
//         type: "size",
//         displayName: "US 10",
//       },
//     ],
//     inventory: {
//       inStock: 50,
//       lowStockThreshold: 10,
//       backorderable: true,
//       preorderable: false,
//     },
//     weight: 0.5,
//     dimensions: {
//       length: 30,
//       width: 15,
//       height: 10,
//     },
//     isActive: true,
//   },
//   {
//     name: "White/Red",
//     sku: "NIKE-AM270-WR",
//     basePrice: 150.0,
//     combination: {
//       id: "white-red",
//       isActive: true,
//       isDefault: false,
//     },
//     options: [
//       {
//         name: "color",
//         value: "white",
//         type: "color",
//         displayName: "White",
//         hexCode: "#FFFFFF",
//       },
//       {
//         name: "size",
//         value: "10",
//         type: "size",
//         displayName: "US 10",
//       },
//     ],
//     inventory: {
//       inStock: 30,
//       lowStockThreshold: 5,
//       backorderable: false,
//       preorderable: true,
//     },
//     weight: 0.5,
//     dimensions: {
//       length: 30,
//       width: 15,
//       height: 10,
//     },
//     isActive: true,
//   },
// ];
