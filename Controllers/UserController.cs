using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankDataWebService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly BankDbContext _db;
        private readonly IPasswordHasher<UserProfile> _hasher;
        public UsersController(BankDbContext db, IPasswordHasher<UserProfile> hasher) { _db = db; _hasher = hasher; }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
        {
            if (await _db.UserProfiles.AnyAsync(u => u.Username == dto.Username)) return Conflict("Username exists");
            if (await _db.UserProfiles.AnyAsync(u => u.Email == dto.Email)) return Conflict("Email exists");

            var user = new UserProfile
            {
                Username = dto.Username,
                Email = dto.Email,
                Address = dto.Address,
                Phone = dto.Phone,
                PictureUrl = dto.PictureUrl
            };
            user.PasswordHash = _hasher.HashPassword(user, dto.Password);
            _db.UserProfiles.Add(user);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetByUsername), new { username = user.Username }, user);
        }

        [HttpGet("byusername/{username}")]
        public async Task<IActionResult> GetByUsername(string username)
        {
            var u = await _db.UserProfiles.Include(x => x.Accounts).FirstOrDefaultAsync(x => x.Username == username);
            if (u == null) return NotFound();
            return Ok(u);
        }

        [HttpGet("byemail/{email}")]
        public async Task<IActionResult> GetByEmail(string email)
        {
            var u = await _db.UserProfiles.Include(x => x.Accounts).FirstOrDefaultAsync(x => x.Email == email);
            if (u == null) return NotFound();
            return Ok(u);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto dto)
        {
            var u = await _db.UserProfiles.FindAsync(id);
            if (u == null) return NotFound();
            u.Email = dto.Email ?? u.Email;
            u.Address = dto.Address ?? u.Address;
            u.Phone = dto.Phone ?? u.Phone;
            u.PictureUrl = dto.PictureUrl ?? u.PictureUrl;
            if (!string.IsNullOrEmpty(dto.NewPassword)) u.PasswordHash = _hasher.HashPassword(u, dto.NewPassword);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var u = await _db.UserProfiles.FindAsync(id);
            if (u == null) return NotFound();
            _db.UserProfiles.Remove(u);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
    public class CreateUserDto { public string Username { get; set; } public string Email { get; set; } public string Address { get; set; } public string Phone { get; set; } public string PictureUrl { get; set; } public string Password { get; set; } }
    public class UpdateUserDto { public string Email { get; set; } public string Address { get; set; } public string Phone { get; set; } public string PictureUrl { get; set; } public string NewPassword { get; set; } }

}
