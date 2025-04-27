// Sample product data with variants
const productData = {
name: "Nike Air Max 270",
description: "The Nike Air Max 270 delivers visible cushioning underfoot and a bold design inspired by Air Max icons.",
price: 150.00,
categories: ["Shoes", "Sports", "Men"],
tags: ["nike", "airmax", "sneakers"],
inStock: 100,
brand: "Nike",
featured: true,
variants: [
{
name: "Black/White",
sku: "NIKE-AM270-BW",
basePrice: 150.00,
combination: {
id: "black-white",
isActive: true,
isDefault: true
},
options: [
{
name: "color",
value: "black",
type: "color",
displayName: "Black",
hexCode: "#000000"
},
{
name: "size",
value: "10",
type: "size",
displayName: "US 10"
}
],
inventory: {
inStock: 50,
lowStockThreshold: 10,
backorderable: true,
preorderable: false
},
weight: 0.5,
dimensions: {
length: 30,
width: 15,
height: 10
},
isActive: true
},
{
name: "White/Red",
sku: "NIKE-AM270-WR",
basePrice: 150.00,
combination: {
id: "white-red",
isActive: true,
isDefault: false
},
options: [
{
name: "color",
value: "white",
type: "color",
displayName: "White",
hexCode: "#FFFFFF"
},
{
name: "size",
value: "10",
type: "size",
displayName: "US 10"
}
],
inventory: {
inStock: 30,
lowStockThreshold: 5,
backorderable: false,
preorderable: true
},
weight: 0.5,
dimensions: {
length: 30,
width: 15,
height: 10
},
isActive: true
}
]
};
