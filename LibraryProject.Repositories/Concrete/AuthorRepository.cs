using LibraryProject.Entities.Model;
using LibraryProject.Repositories.Contract;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.Repositories.Concrete
{
    public class AuthorRepository : RepositoryBase<Author>, IAuthorRepository
    {
        public AuthorRepository(RepositoryContext context) : base(context)
        {
        }

        public void CreateOneAuthor(Author author) => Create(author);

        public void DeleteOneAuthor(Author author) => Delete(author);

        public IQueryable<Author?> GetAllAuthors(bool trackChanges) => FindAll(trackChanges);

        public Author? GetOneAuthor(int id, bool trackChanges) => FindByCondition(a => a.AuthorId.Equals(id), trackChanges);

        public void UpdateOneAuthor(Author author) => Update(author);
    }
}
