using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.Repositories.Contract
{
    public interface IRepositoryManager
    {
        public IAuthorRepository Author { get; }
        public IBookRepository Book { get; }
        public ILoanRepository Loan { get; }
        public void Save();
    }
}
