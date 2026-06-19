'use client'

import { useState, useCallback } from 'react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string
  itemType: string
  color: string
  size: string
  quantity: number
}

interface EmployeeInfo {
  fullName: string
  badgeId: string
  department: string
  email: string
  phone: string
}

interface DeliveryInfo {
  deliveryMethod: 'pickup' | 'ship'
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  zip: string
}

interface FormErrors {
  [key: string]: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ITEM_TYPES = [
  'Polo Shirt',
  'Dress Shirt',
  'Pants/Trousers',
  'Jacket',
  'Vest',
  'Tie',
  'Cap',
  'Other',
]

const COLORS = ['Black', 'Navy Blue', 'Khaki', 'Grey', 'White']

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  'DC',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

function emptyItem(): OrderItem {
  return {
    id: generateId(),
    itemType: '',
    color: '',
    size: '',
    quantity: 1,
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  htmlFor?: string
}

function Field({ label, required, error, children, htmlFor }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OrderForm() {
  // Employee info
  const [employee, setEmployee] = useState<EmployeeInfo>({
    fullName: '',
    badgeId: '',
    department: '',
    email: '',
    phone: '',
  })

  // Order items
  const [items, setItems] = useState<OrderItem[]>([emptyItem()])

  // Delivery
  const [delivery, setDelivery] = useState<DeliveryInfo>({
    deliveryMethod: 'pickup',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
  })

  // Other
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [supervisorName, setSupervisorName] = useState('')

  // UI state
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  // ── Employee handlers ──

  const handleEmployeeChange = useCallback(
    (field: keyof EmployeeInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmployee((prev) => ({ ...prev, [field]: e.target.value }))
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    },
    []
  )

  // ── Item handlers ──

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, emptyItem()])
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    // Clear item errors for removed item
    setErrors((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((k) => {
        if (k.startsWith(`item_${id}`)) delete next[k]
      })
      return next
    })
  }, [])

  const updateItem = useCallback(
    (id: string, field: keyof Omit<OrderItem, 'id'>, value: string | number) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
      )
      setErrors((prev) => {
        const next = { ...prev }
        delete next[`item_${id}_${field}`]
        return next
      })
    },
    []
  )

  // ── Delivery handlers ──

  const handleDeliveryChange = useCallback(
    (field: keyof DeliveryInfo) => (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const value = e.target.value as DeliveryInfo[typeof field]
      setDelivery((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    },
    []
  )

  // ── Validation ──

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    // Employee
    if (!employee.fullName.trim()) newErrors.fullName = 'Full name is required.'
    if (!employee.badgeId.trim()) newErrors.badgeId = 'Badge/ID number is required.'
    if (!employee.department.trim()) newErrors.department = 'Department/Unit is required.'
    if (!employee.email.trim()) {
      newErrors.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) {
      newErrors.email = 'Please enter a valid email address.'
    }
    if (!employee.phone.trim()) newErrors.phone = 'Phone number is required.'

    // Items
    if (items.length === 0) {
      newErrors.items = 'Please add at least one order item.'
    } else {
      items.forEach((item) => {
        if (!item.itemType) newErrors[`item_${item.id}_itemType`] = 'Select an item type.'
        if (!item.color) newErrors[`item_${item.id}_color`] = 'Select a color.'
        if (!item.size) newErrors[`item_${item.id}_size`] = 'Select a size.'
        if (!item.quantity || item.quantity < 1) newErrors[`item_${item.id}_quantity`] = 'Qty must be at least 1.'
      })
    }

    // Delivery
    if (delivery.deliveryMethod === 'ship') {
      if (!delivery.addressLine1.trim()) newErrors.addressLine1 = 'Address is required.'
      if (!delivery.city.trim()) newErrors.city = 'City is required.'
      if (!delivery.state) newErrors.state = 'State is required.'
      if (!delivery.zip.trim()) {
        newErrors.zip = 'ZIP code is required.'
      } else if (!/^\d{5}(-\d{4})?$/.test(delivery.zip.trim())) {
        newErrors.zip = 'Enter a valid ZIP code (e.g. 19380).'
      }
    }

    // Supervisor
    if (!supervisorName.trim()) newErrors.supervisorName = 'Supervisor name is required.'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── Submission ──

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus('idle')

    if (!validate()) {
      // Scroll to first error
      const firstErrorEl = document.querySelector('[data-error="true"]')
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setIsSubmitting(true)

    const payload = {
      ...employee,
      items: items.map(({ id: _id, ...rest }) => rest),
      ...delivery,
      specialInstructions,
      supervisorName,
    }

    try {
      const response = await fetch('/api/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitStatus('success')
        setSubmitMessage(data.message || 'Your order has been submitted successfully.')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setSubmitStatus('error')
        setSubmitMessage(data.error || 'An error occurred. Please try again.')
      }
    } catch {
      setSubmitStatus('error')
      setSubmitMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Success view ──

  if (submitStatus === 'success') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-green-200 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-da-navy mb-2">Order Submitted!</h2>
        <p className="text-gray-600 mb-1">{submitMessage}</p>
        <p className="text-sm text-gray-500 mb-6">
          A confirmation email has been sent to the orders team. Your supervisor,{' '}
          <strong>{supervisorName}</strong>, will be notified for approval.
        </p>
        <button
          onClick={() => {
            setSubmitStatus('idle')
            setEmployee({ fullName: '', badgeId: '', department: '', email: '', phone: '' })
            setItems([emptyItem()])
            setDelivery({ deliveryMethod: 'pickup', addressLine1: '', addressLine2: '', city: '', state: '', zip: '' })
            setSpecialInstructions('')
            setSupervisorName('')
            setErrors({})
          }}
          className="btn-primary"
        >
          Submit Another Order
        </button>
      </div>
    )
  }

  // ── Form ──

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Global error */}
      {submitStatus === 'error' && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6 text-red-700 text-sm">
          <strong>Submission failed:</strong> {submitMessage}
        </div>
      )}

      {/* Validation summary */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6 text-red-700 text-sm">
          <strong>Please fix the following errors before submitting:</strong>
          <ul className="mt-1 ml-4 list-disc space-y-0.5">
            {Object.values(errors).slice(0, 5).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
            {Object.keys(errors).length > 5 && (
              <li>...and {Object.keys(errors).length - 5} more error(s).</li>
            )}
          </ul>
        </div>
      )}

      {/* ── Section 1: Employee Information ── */}
      <section className="form-section" aria-labelledby="employee-section">
        <h2 id="employee-section" className="section-title">
          Employee Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Full Name"
            required
            error={errors.fullName}
            htmlFor="fullName"
          >
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              className={`form-input ${errors.fullName ? 'input-error' : ''}`}
              value={employee.fullName}
              onChange={handleEmployeeChange('fullName')}
              placeholder="Jane Smith"
              data-error={!!errors.fullName}
            />
          </Field>

          <Field
            label="Badge / ID Number"
            required
            error={errors.badgeId}
            htmlFor="badgeId"
          >
            <input
              id="badgeId"
              type="text"
              className={`form-input ${errors.badgeId ? 'input-error' : ''}`}
              value={employee.badgeId}
              onChange={handleEmployeeChange('badgeId')}
              placeholder="DA-12345"
              data-error={!!errors.badgeId}
            />
          </Field>

          <Field
            label="Department / Unit"
            required
            error={errors.department}
            htmlFor="department"
          >
            <input
              id="department"
              type="text"
              className={`form-input ${errors.department ? 'input-error' : ''}`}
              value={employee.department}
              onChange={handleEmployeeChange('department')}
              placeholder="Investigations Unit"
              data-error={!!errors.department}
            />
          </Field>

          <Field
            label="Email Address"
            required
            error={errors.email}
            htmlFor="email"
          >
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              value={employee.email}
              onChange={handleEmployeeChange('email')}
              placeholder="jsmith@chestercountyda.gov"
              data-error={!!errors.email}
            />
          </Field>

          <Field
            label="Phone Number"
            required
            error={errors.phone}
            htmlFor="phone"
          >
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              className={`form-input ${errors.phone ? 'input-error' : ''}`}
              value={employee.phone}
              onChange={handleEmployeeChange('phone')}
              placeholder="(610) 555-0100"
              data-error={!!errors.phone}
            />
          </Field>
        </div>
      </section>

      {/* ── Section 2: Order Items ── */}
      <section className="form-section" aria-labelledby="order-section">
        <h2 id="order-section" className="section-title">
          Order Items
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Add one or more items to your order. Use the &quot;Add Item&quot; button to include additional items.
        </p>

        {errors.items && (
          <p className="field-error mb-3">{errors.items}</p>
        )}

        <div className="space-y-4">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-da-navy">
                  Item #{idx + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="btn-danger text-xs"
                    aria-label={`Remove item ${idx + 1}`}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Item Type */}
                <div className="sm:col-span-2 lg:col-span-2">
                  <Field
                    label="Item Type"
                    required
                    error={errors[`item_${item.id}_itemType`]}
                    htmlFor={`itemType_${item.id}`}
                  >
                    <select
                      id={`itemType_${item.id}`}
                      className={`form-select ${errors[`item_${item.id}_itemType`] ? 'input-error' : ''}`}
                      value={item.itemType}
                      onChange={(e) => updateItem(item.id, 'itemType', e.target.value)}
                      data-error={!!errors[`item_${item.id}_itemType`]}
                    >
                      <option value="">— Select Item Type —</option>
                      {ITEM_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Color */}
                <div>
                  <Field
                    label="Color"
                    required
                    error={errors[`item_${item.id}_color`]}
                    htmlFor={`color_${item.id}`}
                  >
                    <select
                      id={`color_${item.id}`}
                      className={`form-select ${errors[`item_${item.id}_color`] ? 'input-error' : ''}`}
                      value={item.color}
                      onChange={(e) => updateItem(item.id, 'color', e.target.value)}
                      data-error={!!errors[`item_${item.id}_color`]}
                    >
                      <option value="">— Color —</option>
                      {COLORS.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Size */}
                <div>
                  <Field
                    label="Size"
                    required
                    error={errors[`item_${item.id}_size`]}
                    htmlFor={`size_${item.id}`}
                  >
                    <select
                      id={`size_${item.id}`}
                      className={`form-select ${errors[`item_${item.id}_size`] ? 'input-error' : ''}`}
                      value={item.size}
                      onChange={(e) => updateItem(item.id, 'size', e.target.value)}
                      data-error={!!errors[`item_${item.id}_size`]}
                    >
                      <option value="">— Size —</option>
                      {SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Quantity */}
                <div>
                  <Field
                    label="Quantity"
                    required
                    error={errors[`item_${item.id}_quantity`]}
                    htmlFor={`quantity_${item.id}`}
                  >
                    <input
                      id={`quantity_${item.id}`}
                      type="number"
                      min="1"
                      max="99"
                      className={`form-input ${errors[`item_${item.id}_quantity`] ? 'input-error' : ''}`}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value, 10) || 1))
                      }
                      data-error={!!errors[`item_${item.id}_quantity`]}
                    />
                  </Field>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={addItem}
            className="btn-gold flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
        </div>

        {/* Order summary */}
        {items.length > 0 && (
          <div className="mt-4 text-right text-sm text-gray-500">
            Total items in order:{' '}
            <strong className="text-da-navy">
              {items.reduce((sum, item) => sum + (item.quantity || 0), 0)}
            </strong>
            {' '}({items.length} line{items.length !== 1 ? 's' : ''})
          </div>
        )}
      </section>

      {/* ── Section 3: Delivery ── */}
      <section className="form-section" aria-labelledby="delivery-section">
        <h2 id="delivery-section" className="section-title">
          Delivery Information
        </h2>

        <fieldset className="mb-4">
          <legend className="form-label mb-2">
            Delivery Method <span className="text-red-500 ml-0.5">*</span>
          </legend>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="deliveryMethod"
                value="pickup"
                checked={delivery.deliveryMethod === 'pickup'}
                onChange={handleDeliveryChange('deliveryMethod')}
                className="w-4 h-4 text-da-navy focus:ring-da-navy border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                Office Pickup
              </span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="deliveryMethod"
                value="ship"
                checked={delivery.deliveryMethod === 'ship'}
                onChange={handleDeliveryChange('deliveryMethod')}
                className="w-4 h-4 text-da-navy focus:ring-da-navy border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                Ship to Address
              </span>
            </label>
          </div>
        </fieldset>

        {delivery.deliveryMethod === 'ship' && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
            <h3 className="text-sm font-semibold text-da-navy">Shipping Address</h3>

            <Field
              label="Address Line 1"
              required
              error={errors.addressLine1}
              htmlFor="addressLine1"
            >
              <input
                id="addressLine1"
                type="text"
                autoComplete="address-line1"
                className={`form-input ${errors.addressLine1 ? 'input-error' : ''}`}
                value={delivery.addressLine1}
                onChange={handleDeliveryChange('addressLine1')}
                placeholder="123 Main Street"
                data-error={!!errors.addressLine1}
              />
            </Field>

            <Field
              label="Address Line 2"
              error={errors.addressLine2}
              htmlFor="addressLine2"
            >
              <input
                id="addressLine2"
                type="text"
                autoComplete="address-line2"
                className="form-input"
                value={delivery.addressLine2}
                onChange={handleDeliveryChange('addressLine2')}
                placeholder="Suite, Floor, etc. (optional)"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <Field
                  label="City"
                  required
                  error={errors.city}
                  htmlFor="city"
                >
                  <input
                    id="city"
                    type="text"
                    autoComplete="address-level2"
                    className={`form-input ${errors.city ? 'input-error' : ''}`}
                    value={delivery.city}
                    onChange={handleDeliveryChange('city')}
                    placeholder="West Chester"
                    data-error={!!errors.city}
                  />
                </Field>
              </div>

              <div>
                <Field
                  label="State"
                  required
                  error={errors.state}
                  htmlFor="state"
                >
                  <select
                    id="state"
                    autoComplete="address-level1"
                    className={`form-select ${errors.state ? 'input-error' : ''}`}
                    value={delivery.state}
                    onChange={handleDeliveryChange('state')}
                    data-error={!!errors.state}
                  >
                    <option value="">— State —</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div>
                <Field
                  label="ZIP Code"
                  required
                  error={errors.zip}
                  htmlFor="zip"
                >
                  <input
                    id="zip"
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    className={`form-input ${errors.zip ? 'input-error' : ''}`}
                    value={delivery.zip}
                    onChange={handleDeliveryChange('zip')}
                    placeholder="19380"
                    maxLength={10}
                    data-error={!!errors.zip}
                  />
                </Field>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Section 4: Additional Information ── */}
      <section className="form-section" aria-labelledby="additional-section">
        <h2 id="additional-section" className="section-title">
          Additional Information
        </h2>

        <div className="space-y-4">
          <Field
            label="Supervisor Name"
            required
            error={errors.supervisorName}
            htmlFor="supervisorName"
          >
            <input
              id="supervisorName"
              type="text"
              className={`form-input ${errors.supervisorName ? 'input-error' : ''}`}
              value={supervisorName}
              onChange={(e) => {
                setSupervisorName(e.target.value)
                setErrors((prev) => {
                  const next = { ...prev }
                  delete next.supervisorName
                  return next
                })
              }}
              placeholder="Lt. Robert Johnson"
              data-error={!!errors.supervisorName}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your direct supervisor&apos;s name for order approval tracking.
            </p>
          </Field>

          <Field
            label="Special Instructions"
            htmlFor="specialInstructions"
          >
            <textarea
              id="specialInstructions"
              rows={4}
              className="form-input resize-y min-h-[80px]"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests, embroidery details, name tags, etc."
            />
          </Field>
        </div>
      </section>

      {/* ── Submit ── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            <p>
              By submitting this form, you confirm that this order has been authorized by
              your supervisor and is for official use only.
            </p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-shrink-0 flex items-center gap-2 text-base px-8 py-3"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Submitting…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Submit Order Request
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
