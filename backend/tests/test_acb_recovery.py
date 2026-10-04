import time
import unittest
from unittest.mock import Mock, patch
import requests
from backend.services.acb_service import ACBService

class ACBRecoveryTests(unittest.TestCase):
    def test_expired_cache(self):
        with patch.object(ACBService, '_cached_token', 'expired'), patch.object(ACBService, '_token_expires_at', time.time()-1), patch.object(ACBService, 'login', return_value='fresh') as login:
            self.assertEqual(ACBService.get_token(), 'fresh')
            login.assert_called_once()

    def test_401_refresh(self):
        success = Mock(status_code=200)
        success.json.return_value = {'data': []}
        with patch.object(ACBService, 'get_token', return_value='old'), patch.object(ACBService, 'login', return_value='fresh') as login, patch('backend.services.acb_service.requests.get', side_effect=[Mock(status_code=401), success]) as get:
            self.assertEqual(ACBService.get_transaction_history(), [])
            login.assert_called_once()
            self.assertEqual(get.call_count, 2)
            self.assertEqual(get.call_args.kwargs['headers']['Authorization'], 'Bearer fresh')
            self.assertTrue(get.call_args.kwargs['verify'])

    def test_connection_retry(self):
        success = Mock(status_code=200)
        success.json.return_value = {'data': []}
        with patch.object(ACBService, 'get_token', return_value='token'), patch('backend.services.acb_service.time.sleep'), patch('backend.services.acb_service.requests.get', side_effect=[requests.ConnectionError('closed'), success]) as get:
            self.assertEqual(ACBService.get_transaction_history(), [])
            self.assertEqual(get.call_count, 2)

    def test_403_no_retry(self):
        with patch.object(ACBService, 'get_token', return_value='token'), patch.object(ACBService, 'login') as login, patch('backend.services.acb_service.requests.get', return_value=Mock(status_code=403)) as get:
            self.assertIsNone(ACBService.get_transaction_history())
            get.assert_called_once()
            login.assert_not_called()

    def test_malformed_success(self):
        response = Mock(status_code=200)
        response.json.return_value = {'data': {'error': 'unavailable'}}
        with patch.object(ACBService, 'get_token', return_value='token'), patch('backend.services.acb_service.requests.get', return_value=response):
            self.assertIsNone(ACBService.get_transaction_history())

if __name__ == '__main__':
    unittest.main()
