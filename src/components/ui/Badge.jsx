import { nzSuppliers } from '../../data/nzSuppliers'

const SUPPLIER_COLORS = {
  farmlands: 'bg-green-100 text-green-800',
  fruitfed: 'bg-orange-100 text-orange-800',
  horticenter: 'bg-sky-100 text-sky-800',
  pggwrightson: 'bg-purple-100 text-purple-800',
  ravensdown: 'bg-red-100 text-red-800',
  ballance: 'bg-blue-100 text-blue-800',
  yara: 'bg-cyan-100 text-cyan-800',
}

export function SupplierBadge({ supplierId }) {
  const supplier = nzSuppliers[supplierId]
  if (!supplier) return null
  const color = SUPPLIER_COLORS[supplierId] || 'bg-gray-100 text-gray-800'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {supplier.name}
    </span>
  )
}

export function Badge({ children, color = 'gray' }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-800',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${colors[color] || colors.gray}`}>
      {children}
    </span>
  )
}
