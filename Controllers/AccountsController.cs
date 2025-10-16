using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankDataWebService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountsController : ControllerBase
    {
        private readonly IBankService _bank;
        private readonly BankDbContext _db;
        public AccountsController(IBankService bank, BankDbContext db) { _bank = bank; _db = db; }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAccountDto dto)
        {
            // basic validation
            var acc = new Account
            {
                AccountNumber = dto.AccountNumber,
                Balance = dto.InitialBalance,
                AccountType = dto.AccountType,
                OwnerId = dto.OwnerId
            };
            await _bank.CreateAccountAsync(acc);
            return CreatedAtAction(nameof(GetByNumber), new { accountNumber = acc.AccountNumber }, acc);
        }

        [HttpGet("{accountNumber}")]
        public async Task<IActionResult> GetByNumber(string accountNumber)
        {
            var a = await _bank.GetByNumberAsync(accountNumber);
            if (a == null) return NotFound();
            return Ok(a);
        }

        [HttpPut("{accountNumber}")]
        public async Task<IActionResult> Update(string accountNumber, [FromBody] UpdateAccountDto dto)
        {
            var a = await _db.Accounts.FirstOrDefaultAsync(x => x.AccountNumber == accountNumber);
            if (a == null) return NotFound();
            a.AccountType = dto.AccountType ?? a.AccountType;
            a.Balance = dto.Balance ?? a.Balance; // be cautious: updating balance directly is allowed here but normally you'd prefer transactions
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{accountNumber}")]
        public async Task<IActionResult> Delete(string accountNumber)
        {
            var a = await _db.Accounts.FirstOrDefaultAsync(x => x.AccountNumber == accountNumber);
            if (a == null) return NotFound();
            _db.Accounts.Remove(a);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{accountNumber}/deposit")]
        public async Task<IActionResult> Deposit(string accountNumber, [FromBody] AmountDto dto)
        {
            await _bank.DepositAsync(accountNumber, dto.Amount, dto.Description);
            return Ok();
        }

        [HttpPost("{accountNumber}/withdraw")]
        public async Task<IActionResult> Withdraw(string accountNumber, [FromBody] AmountDto dto)
        {
            await _bank.WithdrawAsync(accountNumber, dto.Amount, dto.Description);
            return Ok();
        }

        [HttpGet("{accountNumber}/transactions")]
        public async Task<IActionResult> Transactions(string accountNumber, [FromQuery] int top = 50)
        {
            var txs = await _bank.GetTransactionsAsync(accountNumber, top);
            return Ok(txs);
        }
    }
    public class CreateAccountDto { public string AccountNumber { get; set; } public decimal InitialBalance { get; set; } public string AccountType { get; set; } public int OwnerId { get; set; } }
    public class UpdateAccountDto { public string AccountType { get; set; } public decimal? Balance { get; set; } }
    public class AmountDto { public decimal Amount { get; set; } public string Description { get; set; } }
}
