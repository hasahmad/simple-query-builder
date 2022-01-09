import { Where } from './builder';
import QueryBuilder from './QueryBuilder';

const query = QueryBuilder
  .select(["r.role_id", {'num': "count(*)"}])
  .from({ 'u': 'users' })
  .from({ 'ur': 'user_roles' })
  .from({
    'up': QueryBuilder
      .select()
      .from({'p': 'permissions'})
      .where('p.removed_at', 'IS', 'null')
  })
  .join({'con': 'contacts'}, 'con.contact_id = u.contact_id')
  .joinLeft({'c': 'companies'}, [
    new Where('c.company_id', '=', 'u.company_id', 'AND', true),
    new Where('c.parent_type', '=', 'TENANT', 'AND'),
  ])
  .where('u.user_id', '=', 'ur.user_id', true)
  .where('u.user_id', '=', 'up.user_id', true)
  .orWhere('u.role_id', 'IN', QueryBuilder
    .select(["r.role_id"])
    .from({'r': 'roles'})
    .where('r.removed_at', 'IS NULL')
  )
  .where('u.username', 'IS NOT NULL')
  .where('u.username', 'LIKE', '%admin%')
  .where('u.created_at', 'BETWEEN', [
    new Date(2021, 0, 1), new Date(2022, 0, 9)
  ])
  .where('u.updated_at', '>', new Date(2021, 10, 1))
  .order(['u.user_id'])
  .group(['r.role_id'])
  .having('count(*)', '>=', 1)
  .explain();

console.log(query.build());
/**
 * Output:
 * 
 * EXPLAIN SELECT r.role_id, count(*) AS num FROM users AS u, user_roles AS ur, (SELECT * FROM permissions AS p WHERE (p.removed_at IS NULL)) AS up INNER JOIN contacts AS con ON con.contact_id = u.contact_id LEFT JOIN companies AS c ON ((c.company_id = u.company_id) AND (c.parent_type = 'TENANT')) WHERE (u.user_id = ur.user_id) AND (u.user_id = up.user_id) OR u.role_id IN (SELECT r.role_id FROM roles AS r WHERE r.removed_at IS NULL) AND u.username IS NOT NULL AND u.username LIKE '%admin%' AND u.created_at BETWEEN '2021-01-01T05:00:00.000Z' AND '2022-01-09T05:00:00.000Z' AND (u.updated_at > '2021-11-01T04:00:00.000Z') GROUP BY r.role_id HAVING (count(*) >= 1) ORDER BY u.user_id
 */

