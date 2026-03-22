import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const FAQItem = ({ question, answer, index }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
        open ? 'border-rose-200 shadow-md' : 'border-neutral-200/60 hover:border-rose-200'
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className='w-full flex items-center justify-between p-6 text-left'
      >
        <div className='flex items-center gap-4'>
          <span className='w-7 h-7 bg-rose-50 rounded-full flex items-center justify-center text-xs font-bold text-rose-600 flex-shrink-0'>
            {index + 1}
          </span>
          <span className='font-medium text-neutral-900 text-sm sm:text-base'>{question}</span>
        </div>
        <i className={`ri-arrow-down-s-line text-xl text-neutral-400 transition-transform duration-300 flex-shrink-0 ml-4 ${open ? 'rotate-180 text-rose-600' : ''}`}></i>
      </button>
      {open && (
        <div className='px-6 pb-6'>
          <div className='pl-11'>
            <p className='text-neutral-600 text-sm leading-relaxed'>{answer}</p>
          </div>
        </div>
      )}
    </div>
  )
}

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    // Simulate submission
    setTimeout(() => {
      toast.success('Message sent! We will get back to you soon.')
      setFormData({ name: '', email: '', phone: '', message: '' })
      setSubmitting(false)
    }, 1000)
  }

  return (
    <div className='min-h-screen'>

      Hero Section
      <div className='relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-rose-50/40 via-white to-orange-50/30'>
        <div className='absolute top-0 left-1/4 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none'></div>
        <div className='absolute bottom-0 right-1/4 w-96 h-96 bg-orange-200/15 rounded-full blur-3xl pointer-events-none'></div>
        <div className='relative max-w-4xl mx-auto text-center'>
          <span className='inline-block bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-rose-200'>
            Get In Touch
          </span>
          <h1 className='text-4xl md:text-6xl font-light text-neutral-900 mb-6'>
            Contact <span className='font-medium text-rose-600'>Us</span>
          </h1>
          <p className='text-lg text-neutral-600 max-w-2xl mx-auto'>
            Have a question or need help? We'd love to hear from you.
          </p>
        </div>
      </div>

      {/* Contact Info + Form */}
      <div className='py-20 px-6 lg:px-8'>
        <div className='flex flex-col lg:flex-row gap-12 items-stretch'>

          {/* Left - Contact Info */}
          <div className='w-full lg:w-2/5 space-y-6 flex flex-col'>
            <div>
              <h2 className='text-3xl font-light text-neutral-900 mb-3'>
                Let's <span className='font-medium text-rose-600'>Talk</span>
              </h2>
              <div className='w-16 h-0.5 bg-rose-600 mb-6'></div>
              <p className='text-neutral-600 leading-relaxed'>
                Visit our store or reach out through any of the channels below. Our team is ready to help you find the perfect lighting solution.
              </p>
            </div>

            {/* Contact Cards */}
            <div className='space-y-4'>
              <div className='flex items-start gap-4 bg-white rounded-2xl p-5 border border-neutral-200/60 shadow-sm hover:border-rose-200 hover:shadow-md transition-all'>
                <div className='w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0'>
                  <i className='ri-map-pin-line text-rose-600 text-xl'></i>
                </div>
                <div>
                  <p className='font-medium text-neutral-900 mb-1'>Visit Us</p>
                  <p className='text-sm text-neutral-600 leading-relaxed'>
                    1940/10, Second Floor, Mai H.C. Road<br />
                    Near Gurudwara Sis Ganj Sahib,<br />
                    Opposite OMAXE Mall,<br />
                    Chandni Chowk, Delhi - 110006
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-4 bg-white rounded-2xl p-5 border border-neutral-200/60 shadow-sm hover:border-rose-200 hover:shadow-md transition-all'>
                <div className='w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0'>
                  <i className='ri-phone-line text-rose-600 text-xl'></i>
                </div>
                <div>
                  <p className='font-medium text-neutral-900 mb-1'>Call Us</p>
                  <p className='text-sm text-neutral-600'>+91 9811915725</p>
                  <p className='text-xs text-neutral-400 mt-1'>Mon - Sat, 10am - 7pm</p>
                </div>
              </div>

              <div className='flex items-start gap-4 bg-white rounded-2xl p-5 border border-neutral-200/60 shadow-sm hover:border-rose-200 hover:shadow-md transition-all'>
                <div className='w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0'>
                  <i className='ri-mail-line text-rose-600 text-xl'></i>
                </div>
                <div>
                  <p className='font-medium text-neutral-900 mb-1'>Email Us</p>
                  <p className='text-sm text-neutral-600'>jaisatyaenterprises@gmail.com</p>
                  <p className='text-xs text-neutral-400 mt-1'>We reply within 24 hours</p>
                </div>
              </div>

              <div className='flex items-start gap-4 bg-white rounded-2xl p-5 border border-neutral-200/60 shadow-sm hover:border-rose-200 hover:shadow-md transition-all'>
                <div className='w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0'>
                  <i className='ri-time-line text-rose-600 text-xl'></i>
                </div>
                <div>
                  <p className='font-medium text-neutral-900 mb-1'>Business Hours</p>
                  <p className='text-sm text-neutral-600'>Monday - Saturday: 10am - 7pm</p>
                  <p className='text-sm text-neutral-600'>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Contact Form */}
          <div className='w-full lg:w-3/5 flex flex-col'>
            <div className='bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-8 flex-1 flex flex-col'>
              <h3 className='text-2xl font-light text-neutral-900 mb-6'>
                Send us a <span className='font-medium text-rose-600'>Message</span>
              </h3>
              <form onSubmit={handleSubmit} className='space-y-5 flex-1 flex flex-col'>
                <div className='grid sm:grid-cols-2 gap-5'>
                  <div>
                    <label className='block text-sm font-medium text-neutral-700 mb-2'>Full Name *</label>
                    <input
                      type='text'
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      placeholder='Your full name'
                      className='w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-sm'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-neutral-700 mb-2'>Email Address *</label>
                    <input
                      type='email'
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      placeholder='your@email.com'
                      className='w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-sm'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-neutral-700 mb-2'>Phone Number</label>
                  <input
                    type='tel'
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder='+91 XXXXX XXXXX'
                    className='w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-sm'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-neutral-700 mb-2'>Subject</label>
                  <select
                    className='w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-sm bg-white'
                  >
                    <option value=''>Select a subject</option>
                    <option value='general'>General Inquiry</option>
                    <option value='bulk_order'>Bulk Order</option>
                    <option value='product'>Product Question</option>
                    <option value='wholesale'>Wholesale Partnership</option>
                    <option value='feedback'>Feedback</option>
                  </select>
                </div>
                <div className='flex-1 flex flex-col'>
                  <label className='block text-sm font-medium text-neutral-700 mb-2'>Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    placeholder='Tell us how we can help you...'
                    className='flex-1 w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-sm resize-none min-h-[120px]'
                  />
                </div>
                <div className='flex items-center gap-3 bg-rose-50/50 border border-rose-200/50 rounded-xl p-4 text-xs text-neutral-600'>
                  <i className='ri-information-line text-rose-600 flex-shrink-0 text-base'></i>
                  <p>We typically respond within 24 hours during business hours (Mon-Sat, 10am-7pm)</p>
                </div>
                <button
                  type='submit'
                  disabled={submitting}
                  className='mt-auto w-full bg-gradient-to-r from-rose-600 to-rose-700 text-white py-4 rounded-xl font-medium hover:from-rose-700 hover:to-rose-800 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                  {submitting ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className='ri-send-plane-line'></i>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className='py-20 px-6 lg:px-8 bg-gradient-to-b from-white to-neutral-50'>
        <div className='text-center mb-10'>
          <h2 className='text-4xl font-light text-neutral-900'>
            Visit Our <span className='font-medium text-rose-600'>Showroom</span>
          </h2>
          <div className='w-16 h-0.5 bg-rose-600 mx-auto mt-3 mb-3'></div>
          <p className='text-neutral-600'>Experience our lighting collections in person</p>
        </div>
        <div className='relative rounded-3xl overflow-hidden shadow-xl border border-neutral-200'>
          <iframe
            src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.120547970351!2d77.23044347583803!3d28.65610898300908!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd702c38f3a9%3A0xada8225c6ab5a9c!2sJainnext%20Decoration%20Lighting!5e0!3m2!1sen!2sin!4v1774156551258!5m2!1sen!2sin'
            width='100%'
            height='600'
            style={{ border: 0 }}
            allowFullScreen
            loading='lazy'
            referrerPolicy='no-referrer-when-downgrade'
            className='w-full'
          ></iframe>
          {/* Info overlay */}
          <div className='absolute bottom-6 left-6 bg-white rounded-2xl shadow-lg p-5 max-w-xs border border-neutral-100'>
            <p className='font-semibold text-neutral-900 mb-1'>Jainnext Showroom</p>
            <p className='text-sm text-neutral-600 mb-3'>
              1940/10, Second Floor, Chandni Chowk, Delhi - 110006
            </p>
            <a
              href='https://maps.google.com/?q=Jainnext+Decoration+Lighting+Chandni+Chowk+Delhi'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors'
            >
              <i className='ri-map-pin-line'></i>
              Get Directions
              <i className='ri-external-link-line text-xs'></i>
            </a>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className='py-20 px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h2 className='text-4xl font-light text-neutral-900'>
            Frequently Asked <span className='font-medium text-rose-600'>Questions</span>
          </h2>
          <div className='w-16 h-0.5 bg-rose-600 mx-auto mt-3 mb-3'></div>
          <p className='text-neutral-600'>Everything you need to know about our products and services</p>
        </div>
        <div className='max-w-3xl mx-auto space-y-4'>
          {[
            {
              q: 'What types of lighting products do you offer?',
              a: 'We offer a wide range including Decorative Lights, LED Flood Lights, LED Strip Lights, LED Rope Lights, String Lights, Curtain Lights, and much more for both indoor and outdoor use.'
            },
            {
              q: 'Do you offer wholesale pricing?',
              a: 'Yes! We are a trusted wholesaler and distributor. Apply for a wholesale account to get exclusive bulk pricing with savings of up to 40% off retail prices.'
            },
            {
              q: 'What is your delivery timeframe?',
              a: 'We deliver pan India. Standard delivery takes 3-7 business days depending on your location. Express delivery options are available for select areas.'
            },
            {
              q: 'What is your return policy?',
              a: 'We offer a 7-day return and exchange policy. Products must be in original condition and packaging. Contact us to initiate a return or exchange.'
            },
            {
              q: 'Do you provide installation support?',
              a: 'While we do not provide installation services directly, our team is available to guide you through the installation process via phone or email support.'
            },
            {
              q: 'How can I track my order?',
              a: 'Once your order is shipped, you will receive a tracking number via email or SMS. You can track your order from the Orders section in your account.'
            }
          ].map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Contact
