import OrderForm from '@/components/OrderForm'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-da-navy text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-da-gold text-xs font-semibold uppercase tracking-widest mb-0.5">
                Chester County District Attorney&apos;s Office
              </div>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight">
                Uniform Order Request Form
              </h1>
            </div>
            <div className="hidden sm:flex flex-col items-end text-right">
              <div className="text-da-gold text-xs font-medium uppercase tracking-wider">
                Provided by
              </div>
              <div className="text-white font-semibold text-sm">
                McDonald Uniforms
              </div>
            </div>
          </div>
        </div>
        {/* Gold accent bar */}
        <div className="h-1 bg-da-gold" />
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
          <strong>Instructions:</strong> Complete all required fields below and click &quot;Submit Order Request&quot; when finished.
          Your order will be reviewed by your supervisor and processed by McDonald Uniforms.
          You will receive a confirmation email once your order has been submitted.
        </div>

        <OrderForm />
      </main>

      {/* Footer */}
      <footer className="bg-da-navy text-gray-300 mt-12">
        <div className="h-1 bg-da-gold" />
        <div className="max-w-4xl mx-auto px-4 py-5 sm:px-6 text-center text-xs">
          <p className="mb-1">
            <span className="text-da-gold font-semibold">Chester County District Attorney&apos;s Office</span>
            {' — '}Uniform Order System
          </p>
          <p>
            Uniform orders are fulfilled by{' '}
            <span className="text-white font-medium">McDonald Uniforms</span>.
            For assistance, contact your department administrator.
          </p>
        </div>
      </footer>
    </div>
  )
}
