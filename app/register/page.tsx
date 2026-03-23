import RegisterForm from './RegisterForm'

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Един неразделен клас</h1>
          <p className="mt-2 text-gray-500 text-sm">
            Създайте акаунт, за да започнете
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Регистрация на модератор</h2>
          <RegisterForm />
        </div>
      </div>
    </main>
  )
}
