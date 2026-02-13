import productOil from "@/assets/product-oil.jpg";
import productFilter from "@/assets/product-filter.jpg";
import productBrakeFluid from "@/assets/product-brake-fluid.jpg";
import productCoolant from "@/assets/product-coolant.jpg";
import productTransmission from "@/assets/product-transmission.jpg";
import productGrease from "@/assets/product-grease.jpg";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Aceite de Motor 10W-40",
    description: "Aceite semisintético de alto rendimiento para motores a gasolina y diésel. Protección superior contra el desgaste y estabilidad térmica excepcional. Ideal para vehículos con alto kilometraje.",
    price: 45000,
    stock: 24,
    image: productOil,
    category: "Aceites",
  },
  {
    id: 2,
    name: "Filtro de Aceite Universal",
    description: "Filtro de aceite de alta eficiencia con tecnología de filtrado avanzada. Compatible con múltiples marcas y modelos. Garantiza la máxima protección del motor.",
    price: 18000,
    stock: 36,
    image: productFilter,
    category: "Filtros",
  },
  {
    id: 3,
    name: "Líquido de Frenos DOT 4",
    description: "Líquido de frenos de alto punto de ebullición para máxima seguridad. Resistente a la absorción de humedad. Compatible con sistemas ABS y convencionales.",
    price: 22000,
    stock: 15,
    image: productBrakeFluid,
    category: "Líquidos",
  },
  {
    id: 4,
    name: "Refrigerante Anticongelante",
    description: "Refrigerante de larga duración con protección contra la corrosión. Previene el sobrecalentamiento y la congelación del motor. Fórmula libre de silicatos.",
    price: 28000,
    stock: 20,
    image: productCoolant,
    category: "Líquidos",
  },
  {
    id: 5,
    name: "Aceite de Transmisión ATF",
    description: "Aceite para transmisión automática de última generación. Excelente estabilidad a altas temperaturas y protección contra el desgaste. Cambios suaves y precisos.",
    price: 55000,
    stock: 12,
    image: productTransmission,
    category: "Aceites",
  },
  {
    id: 6,
    name: "Grasa Multiuso EP2",
    description: "Grasa de litio de alta calidad para rodamientos, articulaciones y puntos de lubricación general. Excelente resistencia al agua y a la carga. Larga duración.",
    price: 15000,
    stock: 30,
    image: productGrease,
    category: "Grasas",
  },
];

export const WHATSAPP_NUMBER = "595981123456"; // Reemplazar con número real
