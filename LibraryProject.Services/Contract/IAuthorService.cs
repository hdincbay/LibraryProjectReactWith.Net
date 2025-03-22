using LibraryProject.Entities.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.Services.Contract
{
    public interface IAuthorService
    {
        public IEnumerable<Author?> GetAll(bool trackChanges);
        public Author? GetOne(int id, bool trackChanges);
        public void CreateOne(Author author);
        public void UpdateOne(Author author);
        public void DeleteOne(int id);
    }
}
