/**
 * Datos de ejemplo para maquetar el panel mientras no hay pedidos reales.
 * Se reemplaza por lecturas de Firestore (Admin SDK) en la Fase 5.
 */
import type { EstadoPedido } from "@/lib/firebase/tipos";

export interface PedidoDemo {
  codigo: string;
  clienteNombre: string;
  clienteTelefono: string;
  articulos: number;
  miniaturas: number;
  total: number;
  estado: EstadoPedido;
  hace: string;
  atrasado?: boolean;
}

export const RESUMEN_DIA = {
  pendientes: 3,
  ventasConfirmadas: 12450,
  entregadosHoy: 2,
  ticketPromedio: 2180,
};

export const ALERTAS: Array<{ tipo: "stock" | "foto" | "atraso"; texto: string }> =
  [
    { tipo: "atraso", texto: "1 pedido pendiente de más de 24 horas" },
    { tipo: "stock", texto: "2 productos con stock bajo (≤ 3 unidades)" },
    { tipo: "foto", texto: "1 producto activo sin foto" },
  ];

export const PEDIDOS_DEMO: PedidoDemo[] = [
  {
    codigo: "PED-8F3K",
    clienteNombre: "María Pérez",
    clienteTelefono: "18095551234",
    articulos: 3,
    miniaturas: 3,
    total: 4800,
    estado: "pendiente",
    hace: "hace 12 min",
  },
  {
    codigo: "PED-2Q7P",
    clienteNombre: "Luis Rodríguez",
    clienteTelefono: "18294447788",
    articulos: 1,
    miniaturas: 1,
    total: 1250,
    estado: "pendiente",
    hace: "hace 3 h",
  },
  {
    codigo: "PED-5RT9",
    clienteNombre: "Ana Jiménez",
    clienteTelefono: "18493332211",
    articulos: 6,
    miniaturas: 4,
    total: 6900,
    estado: "pendiente",
    hace: "hace 1 día",
    atrasado: true,
  },
  {
    codigo: "PED-1M4C",
    clienteNombre: "Carlos Núñez",
    clienteTelefono: "18095559090",
    articulos: 2,
    miniaturas: 2,
    total: 3400,
    estado: "confirmado",
    hace: "hace 5 h",
  },
  {
    codigo: "PED-9K2D",
    clienteNombre: "Rosa Castillo",
    clienteTelefono: "18296661212",
    articulos: 4,
    miniaturas: 4,
    total: 5600,
    estado: "confirmado",
    hace: "ayer",
  },
  {
    codigo: "PED-7B8X",
    clienteNombre: "Pedro Santos",
    clienteTelefono: "18091238899",
    articulos: 2,
    miniaturas: 2,
    total: 2100,
    estado: "entregado",
    hace: "hace 2 días",
  },
  {
    codigo: "PED-4H6L",
    clienteNombre: "Yerlin Mateo",
    clienteTelefono: "18494561234",
    articulos: 1,
    miniaturas: 1,
    total: 950,
    estado: "cancelado",
    hace: "hace 3 días",
  },
];
