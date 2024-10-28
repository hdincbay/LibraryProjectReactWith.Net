using LibraryProject.Entities.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.Repositories.Contract
{
    public interface ILoanRepository : IRepositoryBase<Loan>
    {
        public IQueryable<Loan?> GetAllLoans(bool trackChanges);
        public Loan? GetOneLoan(int id, bool trackChanges);
        public void CreateOneLoan(Loan loan);
        public void UpdateOneLoan(Loan loan);
        public void DeleteOneLoan(Loan loan);
    }
}
