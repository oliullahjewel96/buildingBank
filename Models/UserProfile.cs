using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class UserProfile
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(80)]
    public string Username { get; set; }

    [Required, MaxLength(120), EmailAddress]
    public string Email { get; set; }

    [MaxLength(200)]
    public string Address { get; set; }

    [MaxLength(30)]
    public string Phone { get; set; }

    // store hashed password only
    [Required]
    public string PasswordHash { get; set; }

    public string PictureUrl { get; set; }
    public ICollection<Account> Accounts { get; set; }

}

