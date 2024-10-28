using LibraryProject.Entities.Model;
using LibraryProject.Repositories.Contract;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.Repositories.Concrete
{
    public class BookRepository : RepositoryBase<Book>, IBookRepository
    {
        public BookRepository(RepositoryContext context) : base(context)
        {
        }

        public void CreateOneBook(Book book) => Create(book);

        public void DeleteOneBook(Book book) => Delete(book);

        public IQueryable<Book?> GetAllBooks(bool trackChanges) => FindAll(trackChanges);

        public Book? GetOneBook(int id, bool trakChanges) => FindByCondition(b => b.BookId.Equals(id), trakChanges);

        public void UpdateOneBook(Book book) => Update(book);
    }
}
