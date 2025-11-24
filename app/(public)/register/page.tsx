export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Регистрация</h1>
      <p className="mb-6">Введите данные, чтобы войти в личный кабинет</p>

      <form className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1 font-medium">
            Почта
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              placeholder="К примеру, командировка в Москве"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block mb-1 font-medium">
            Пароль
          </label>
          <div className="relative">
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              placeholder="К примеру, командировка в Москве"
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block mb-1 font-medium">
            Повторите пароль
          </label>
          <div className="relative">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              placeholder="К примеру, командировка в Москве"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Подтвердить
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        У вас уже есть аккаунт?{' '}
        <a href="/login" className="text-blue-600 hover:underline">
          Войти
        </a>
      </p>
    </div>
  );
}