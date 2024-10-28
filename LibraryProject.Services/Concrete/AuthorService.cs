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
    public class AuthorService : IAuthorService
    {
        private readonly IRepositoryManager _manager;

        public AuthorService(IRepositoryManager manager)
        {
            _manager = manager;
        }

        public void CreateOne(Author author)
        {
            _manager.Author.CreateOneAuthor(author);
            _manager.Save();
        }

        public void DeleteOne(int id)
        {
            var model = _manager.Author.GetOneAuthor(id, true);
            if(model is not null)
            {
                _manager.Author.DeleteOneAuthor(model);
                _manager.Save();
            }
        }

        public IEnumerable<Author?> GetAll(bool trackChanges) => _manager.Author.GetAllAuthors(trackChanges);

        public Author? GetOne(int id, bool trackChanges) => _manager.Author.GetOneAuthor(id, trackChanges);

        public void UpdateOne(int id)
        {
            var model = _manager.Author.GetOneAuthor(id, true);
            if(model is not null)
            {
                _manager.Author.UpdateOneAuthor(model);
                _manager.Save();
            }
        }
    }
}
