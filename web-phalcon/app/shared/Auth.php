<?php
namespace NetAssist\Shared;
use Phalcon\Mvc\User\Component;

use NetAssist\Models\Users;
use NetAssist\Models\AuthToken;

use MongoDate;
use MongoId;
use Exception;

/**
 * NetAssist\Shared\Auth
 * Manages Authentication/Identity Management in NetGraphz2
 * Based on Vokuro Auth component
 */
class Auth extends Component
{

    /**
    * Clean expired session tokens
    * @param array $tokens
    * @return array|null Modified user tokens array or null
    */
    private function cleanUserTokens($tokens){
          if(!is_array($tokens)){
            return null;
          }
          foreach ($tokens as $key => $token) {
            $token = (object) $token;
            if(!property_exists($token, "createDate")){
                    unset($tokens[$key]); //remove session without date
                    continue;
            }
            $diff = time() - $token->createDate->sec;
            if($diff > $this->config->application->rememberLifeTime){
                unset($tokens[$key]); //clean-out old sessions
            }
          }
          return $tokens;
    }

    /**
    * Generate random string
    *
    * @param int $length Specify length of random string
    * @return string Random string
    */
    private function generateRandomString($length = 10) {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }

    /**
     * Checks the user credentials
     *
     * @param array $credentials
     */
    public function check($credentials)
    {
        $user = Users::findFirst(array(
            array(
                "login" => $credentials['login']
            )
        ));

        if ($user == null) {
            $this->registerUserThrottling(null);
            throw new Exception('Wrong email/password combination');
        }
        // Check the password
        if (!$this->security->checkHash($credentials['password'], $user->password)) {
            $user = $this->registerUserThrottling($user);
            $user->save();
            throw new Exception('Wrong email/password combination');
        }
        // Clean user tokens
        $user->tokens = $this->cleanUserTokens($user->tokens);
        $user->save();

        // Check if the user was flagged
        $this->checkUserFlags($user);
        // Register the successful login
        $this->saveSuccessLogin($user);
        // Check if the remember me was selected
        if (isset($credentials['remember'])) {
              $this->createRememberEnviroment($user);
        }
        $this->session->set('auth-identity', array(
            'id' => $user->_id,
            'name' => $user->login
        ));
    }

    /**
     * Creates the remember me environment settings the related cookies and generating tokens
     *
     * @param NetAssist\Models\Users $user
     */
    public function saveSuccessLogin($user)
    {
        $user->lastLoginDate = new MongoDate(time());
        $user->failedLoginAttempts = 0;
        $user->save();
    }

    /**
     * Implements login throttling
     * Reduces the efectiveness of brute force attacks
     * Block user if user overlimited login attempts
     *
     * @param \NetAssist\Models\Users $user
     * @return \NetAssist|Models\Users Modified user
     */
    public function registerUserThrottling($user)
    {
        if($user == null){
          return;
        }
        if($user->blocked) return; //already blocked

        $mongoNow = new MongoDate(time());

        if($user->failedLoginLastDate == null
            || $user->failedLoginWindowStartDate == null){
            $user->failedLoginLastDate = $mongoNow;
            $user->failedLoginWindowStartDate = $mongoNow;
            $user->failedLoginAttempts = 1;
        }
        else {
            $last = $user->failedLoginLastDate->sec;
            $window = $user->failedLoginWindowStartDate->sec;
            if($last-$window < $this->config->failLoginWindowTime)
              $user->failedLoginAttempts ++;
            else {
              $user->failedLoginAttempts = 1;
            }
            $user->failedLoginLastDate = $mongoNow;
        }
        if($user->failedLoginAttempts >= $this->config->application->failLoginWindowMaxCount){
            if($this->config->application->failLoginBlockPermament)
              $user->blocked = true;
            else
              $user->failedLoginBlock = true;
            sleep(2);
        }
        return $user;
    }

    /**
    * Generate user authentication token
    *
    * @param string Email to include
    * @param string UserAgent to include
    * @return |NetAssist\Models\AuthToken Created token
    */
    public function createUserAuthToken($email, $ip, $userAgent){
        $token = new AuthToken();
        $token->createDate = new MongoDate(time());
        $token->salt = $this->generateRandomString(12);
        $token->ip = $ip;
        $token->userAgent = $userAgent;
        $token->email = $email;
        $token->value = hash("sha256", $email . $userAgent . $ip . time() . $this->generateRandomString(12));
        return $token;
    }

    /**
     * Creates the remember me environment settings the related cookies and generating tokens
     *
     * @param NetAssist\Models\Users $user
     */
    public function createRememberEnviroment(Users $user)
    {
        $token = $this->createUserAuthToken($user->email,
                 $this->request->getClientAddress(),
                 $this->request->getUserAgent());
        $user->tokens[$token->value] = $token;
        if($user->save() != false){
          $expire = time() + $this->config->application->rememberLifeTime;
          $this->cookies->set('RMU', $user->_id, $expire);
          $this->cookies->set('RMT', $token->value, $expire);
          $this->cookies->send();
        }

    }

    /**
     * Check if the session has a remember me cookie
     *
     * @return boolean
     */
    public function hasRememberMe()
    {
        return $this->cookies->has('RMU');
    }
    /**
     * Logs on using the information in the coookies
     *
     * @return Phalcon\Http\Response
     */
    public function loginWithRememberMe()
    {
        $userId = $this->cookies->get('RMU')->getValue();
        $userId = substr($userId, 0, 24);
        $cookieToken = $this->cookies->get('RMT')->getValue();

        $user = Users::findById(new MongoId($userId));
        if ($user && $user != null && array_key_exists($cookieToken, $user->tokens)) {
          $token = (object)$user->tokens[$cookieToken];
          // Check if the cookie token has not expired
          if ( (time() - $token->createDate->sec) < $this->config->application->rememberLifeTime){
            // Check if the user was flagged
            $this->checkUserFlags($user);
            // Register identity
            $this->session->set('auth-identity', array(
              'id' => $user->_id,
              'name' => $user->login
            ));
            // Register the successful login
            $this->saveSuccessLogin($user);
            return $this->response->redirect();
          }
        }
        $this->cookies->get('RMU')->delete();
        $this->cookies->get('RMT')->delete();
        return $this->response->redirect('Account/Login');
    }

    /**
     * Checks if the user is banned/inactive/suspended/temporary blocked
     *
     * @param NetAssist\Models\Users $user
     */
    public function checkUserFlags(Users $user)
    {
        if( $user->inactive )
            throw new Exception('The user is inactive');
        if ( $user->blocked )
            throw new Exception('The user is blocked');
        if( $user->lastLoginDate != null ){
          $login_int =  $user->failedLoginLastDate->sec - time();
          if ( $user->failedLoginBlock && $login_int < $this->config->application->failLoginBlockTime){
              throw new Exception('The user is temporary blocked');
          }
          else {
              $user->failedLoginBlock = false;
          }
          $user->save();
        }
    }
    /**
     * Returns the current identity
     *
     * @return array
     */
    public function getIdentity()
    {
        return $this->session->get('auth-identity');
    }
    /**
     * Returns the current identity
     *
     * @return string
     */
    public function getName()
    {
        $identity = $this->getIdentity();
        return $identity['name'];
    }

    /**
    * Returns user identifier
    *
    * @return \MongoId
    */
    public function getUserId(){
        $identity = $this->getIdentity();
        return new MongoId(substr($identity['id'], 0, 24));
    }

    /**
     * Removes the user identity information from session
     */
    public function remove()
    {
        if ($this->cookies->has('RMU')) {
            $this->cookies->get('RMU')->delete();
        }
        if ($this->cookies->has('RMT')) {
            $tokenVal = $this->cookies->get('RMT')->getValue();
            $user = $this->getUser();
            if($user != false && array_key_exists($tokenVal, $user->tokens)){
                unset($user->tokens[$tokenVal]);
            }
            $user->save();
            $this->cookies->get('RMT')->delete();
        }
        $this->session->remove('auth-identity');
    }
    /**
     * Auths the user by his/her id
     *
     * @param int $id
     */
    public function authUserById($id)
    {
        $user = Users::findById(new MongoId($id));
        if ($user == false) {
            throw new Exception('The user does not exist');
        }
        $this->checkUserFlags($user);
        $this->session->set('auth-identity', array(
            'id' => $user->_id,
            'name' => $user->login
        ));
    }
    /**
     * Get the entity related to user in the active identity
     *
     * @return \NetAssist\Models\Users
     */
    public function getUser()
    {
        $identity = $this->session->get('auth-identity');
        if (isset($identity['id'])) {
            $user = Users::findById(new MongoId(substr($identity['id'], 0, 24)));
            if ($user == false) {
                throw new Exception('The user does not exist');
            }
            return $user;
        }
        return false;
    }
}
