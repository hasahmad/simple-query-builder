import Select from './Select';

const query = new Select()
  .select(["u.user_id", "u.username", "ur.role_id"])
  .from({ 'u': 'users' })
  .from({ 'ur': 'user_roles' })
  .from({
    'up': (new Select())
      .select()
      .from({'p': 'permissions'})
      .where('p.removed_at', 'IS', 'null')
  })
  .where('u.user_id', '=', 'ur.user_id', true)
  .orWhere('u.role_id', 'IN', (new Select())
    .select(["r.role_id"])
    .from({'r': 'roles'})
    .where('r.removed_at', 'IS', 'null')
  )
  .where('u.username', 'IS NOT', null);

console.log(query.build());
/**
 * Output:
 * 
 * SELECT u.user_id, u.username, ur.role_id FROM users AS u, user_roles AS ur, (SELECT * FROM permissions AS p WHERE (p.removed_at IS NULL)) AS up WHERE (u.user_id = ur.user_id) OR (u.role_id IN (SELECT r.role_id FROM roles AS r WHERE (r.removed_at IS NULL))) AND (u.username IS NOT NULL)
 */

