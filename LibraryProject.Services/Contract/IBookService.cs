using LibraryProject.Entities.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.Services.Contract
{
    public interface IBookService
    {
        public IEnumerable<Book?> GetAll(bool trackChanges);
        public IEnumerable<Book?> GetNotAvailableAllBook(bool trackChanges);
        public Book? GetOne(int id, bool trackChanges);
        public void CreateOne(Book book);
        public void UpdateOne(Book book);
        public void DeleteOne(int id);
    }
}
