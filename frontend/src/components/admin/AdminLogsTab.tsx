import react from 'react';
import { fetchAdminLogs } from '../../api/admin';   
fetchAdminLogs().then(logs => {
  console.log(logs);
}).catch(err => {
  console.error('Error fetching logs:', err);
});

