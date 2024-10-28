using LibraryProject.Entities.Model;
using LibraryProject.Repositories.Contract;
using LibraryProject.Services.Contract;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.Services.Concrete
{
    public class BookService : IBookService
    {
        private readonly IRepositoryManager _manager;

        public BookService(IRepositoryManager manager)
        {
            _manager = manager;
        }

        public void CreateOne(Book book)
        {
            _manager.Book.CreateOneBook(book);
            _manager.Save();
        }

        public void DeleteOne(int id)
        {
            var model = _manager.Book.GetOneBook(id, true);
            if(model is not null)
            {
                _manager.Book.DeleteOneBook(model);
                _manager.Save();
            }
        }

        public IEnumerable<Book?> GetAll(bool trakChanges) => _manager.Book.GetAllBooks(trakChanges);

        public Book? GetOne(int id, bool trackChanges) => _manager.Book.GetOneBook(id, trackChanges);

        public void UpdateOne(int id)
        {
            var model = _manager.Book.GetOneBook(id, true);
            if(model is not null)
            {
                _manager.Book.UpdateOneBook(model);
                _manager.Save();
            }
        }
    }
}
