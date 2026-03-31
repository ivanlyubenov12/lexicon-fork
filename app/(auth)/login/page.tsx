import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>Вход</h1>
        <p className="mt-2 text-gray-500 text-sm">Влезте в своя акаунт</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <LoginForm />
      </div>
    </div>
  )
}
