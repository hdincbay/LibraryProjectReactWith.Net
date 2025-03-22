using LibraryProject.Entities.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.Repositories.Contract
{
    public interface IAuthorRepository : IRepositoryBase<Author>
    {
        public IQueryable<Author?> GetAllAuthors(bool trackChanges);
        public Author? GetOneAuthor(int id, bool trackChanges);
        public void CreateOneAuthor(Author author);
        public void UpdateOneAuthor(Author author);
        public void DeleteOneAuthor(Author author);
    }
}
