export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-green-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
