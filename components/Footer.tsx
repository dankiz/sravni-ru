export default function Footer() {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary-400">Агрегатор Курсов</h3>
            <p className="text-gray-400 leading-relaxed">
              Каталог лучших онлайн-курсов с отзывами и рейтингами. Найдите идеальный курс для себя.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary-400">Навигация</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/courses" className="hover:text-primary-400 transition">Каталог курсов</a></li>
              <li><a href="/add-course" className="hover:text-primary-400 transition">Добавить курс</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary-400">О платформе</h3>
            <p className="text-gray-400 leading-relaxed">
              Все курсы проходят модерацию перед публикацией. Мы за качественный контент.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Агрегатор Курсов. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}
