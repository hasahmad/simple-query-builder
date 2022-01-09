import Builder from './Builder';

const query = new Builder()
  .select(["r.role_id", {'num': "count(*)"}])
  .from({ 'u': 'users' })
  .from({ 'ur': 'user_roles' })
  .from({
    'up': (new Builder())
      .select()
      .from({'p': 'permissions'})
      .where('p.removed_at', 'IS', 'null')
  })
  .where('u.user_id', '=', 'ur.user_id', true)
  .where('u.user_id', '=', 'up.user_id', true)
  .orWhere('u.role_id', 'IN', (new Builder())
    .select(["r.role_id"])
    .from({'r': 'roles'})
    .where('r.removed_at', 'IS', 'null')
  )
  .where('u.username', 'IS NOT', null)
  .order(['u.user_id'])
  .group(['r.role_id'])
  .having('count(*)', '>=', 1);

console.log(query.build());
/**
 * Output Formatted:
 * 
 * SELECT r.role_id,
 *   count(*) AS num
 * FROM users AS u,
 *   user_roles AS ur,
 *   (
 *     SELECT *
 *     FROM permissions AS p
 *     WHERE (p.removed_at IS NULL)
 *   ) AS up
 * WHERE (u.user_id = ur.user_id)
 *   AND (u.user_id = up.user_id)
 *   OR (
 *     u.role_id IN (
 *       SELECT r.role_id
 *       FROM roles AS r
 *       WHERE (r.removed_at IS NULL)
 *     )
 *   )
 *   AND (u.username IS NOT NULL)
 * GROUP BY r.role_id
 * HAVING (count(*) >= 1)
 * ORDER BY u.user_id
 */

