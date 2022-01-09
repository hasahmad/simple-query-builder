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
    .where('r.removed_at', 'IS NULL')
  )
  .where('u.username', 'IS NOT NULL')
  .where('u.username', 'LIKE', '%admin%')
  .where('u.created_at', 'BETWEEN', [
    new Date(2021, 0, 1), new Date()
  ])
  .where('u.updated_at', '>', new Date(2021, 10, 1))
  .order(['u.user_id'])
  .group(['r.role_id'])
  .having('count(*)', '>=', 1);

console.log(query.build());
/**
 * Output:
 * 
 * SELECT r.role_id, count(*) AS num FROM users AS u, user_roles AS ur, (SELECT * FROM permissions AS p WHERE (p.removed_at IS NULL)) AS up WHERE (u.user_id = ur.user_id) AND (u.user_id = up.user_id) OR u.role_id IN (SELECT r.role_id FROM roles AS r WHERE r.removed_at IS NULL) AND u.username IS NOT NULL AND u.username LIKE '%admin%' AND u.created_at BETWEEN '2021-01-01T05:00:00.000Z' AND '2022-01-09T02:01:37.157Z' AND (u.updated_at > '2021-11-01T04:00:00.000Z') GROUP BY r.role_id HAVING (count(*) >= 1) ORDER BY u.user_id
 */

