using LibraryProject.Entities.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.Repositories.Contract
{
    public interface IBookRepository : IRepositoryBase<Book>
    {
        public IQueryable<Book?> GetAllBooks(bool trackChanges);
        public Book? GetOneBook(int id, bool trakChanges);
        public void CreateOneBook(Book book);
        public void UpdateOneBook(Book book);
        public void DeleteOneBook(Book book);
    }
}
