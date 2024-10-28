using LibraryProject.Entities.Model;
using LibraryProject.Repositories.Contract;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.Repositories.Concrete
{
    public class LoanRepository : RepositoryBase<Loan>, ILoanRepository
    {
        public LoanRepository(RepositoryContext context) : base(context)
        {
        }

        public void CreateOneLoan(Loan loan) => Create(loan);

        public void DeleteOneLoan(Loan loan) => Delete(loan);

        public IQueryable<Loan?> GetAllLoans(bool trackChanges) => FindAll(trackChanges);

        public Loan? GetOneLoan(int id, bool trackChanges) => FindByCondition(l => l.LoanId.Equals(id), trackChanges);

        public void UpdateOneLoan(Loan loan) => Update(loan);
    }
}
