import RegisterForm from './RegisterForm'

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>Регистрация</h1>
        <p className="mt-2 text-gray-500 text-sm">Създайте акаунт за модератор или родител</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <RegisterForm />
      </div>
    </div>
  )
}
