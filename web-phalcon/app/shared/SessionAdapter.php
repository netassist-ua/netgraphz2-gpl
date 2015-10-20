<?php
namespace NetAssist\Shared;
use Phalcon\Session\Adapter\Files;

class SessionAdapter extends Files
{
   /**
   *  Checks if session is already starterd
   *  @return bool
   */
    public function isStarted()
    {
      return session_status() != PHP_SESSION_NONE;
    }

    /**
     * Starts the session
     * @return bool
     */
    public function start()
    {
        // Check that session is not already started
        if ($this->isStarted()) {
            return false;
        }

        // Get current cookie options
        $options = $this->getCookieOptions();

        // Set cookie name
        session_name($options['name']);

        // Set cookie parameters
        session_set_cookie_params(
            $options['lifetime'], $options['path'], $options['domain'],
            $options['secure'], $options['httponly']
        );
        // Start session
        return parent::start();
    }

    /**
     * Destroys current session and removes session cookie
     * @return bool
     */
    public function destroy()
    {
        // Remove session cookie
        $options = $this->getCookieOptions();
        if (!setcookie($options['name'], '', -1)) {
            return false;
        }

        // Clean session data
        return parent::destroy();
    }

    /**
     * Sets cookie lifetime to zero
     * @return bool
     */
    public function setShortLifetime()
    {
        if (!$this->isStarted()) {
            return false;
        }

        // Get cookie options
        $options = $this->getCookieOptions();

        // Short session, will be finished after browser will be closed
        $options['lifetime'] = 0;

        // Session id
        $id = session_id();

        // Set new cookie
        return setcookie(
            $options['name'], $id, $options['lifetime'], $options['path'],
            $options['domain'], $options['secure'], $options['httponly']
        );
    }


    /**
     * Returns current session cookie configuration
     * @return array
     */
    public function getCookieOptions()
    {
        // Get default cookie options
        $options = session_get_cookie_params();

        // Cookie name
        $options['name'] = session_name();
        if (!empty($this->_options['cookie']['name'])) {
            $options['name'] = (string) $this->_options['cookie']['name'];
        }

        // Cookie lifetime
        if (!empty($this->_options['cookie']['lifetime'])) {
            $options['lifetime'] = (int) $this->_options['cookie']['lifetime'];
        }

        // Path
        if (!empty($this->_options['cookie']['path'])) {
            $options['path'] = (string) $this->_options['cookie']['path'];
        }

        // Domain
        if (!empty($this->_options['cookie']['domain'])) {
            $options['domain'] = (string) $this->_options['cookie']['domain'];
        }

        // Secure
        if (!empty($this->_options['cookie']['secure'])) {
            $options['secure'] = (bool) $this->_options['cookie']['secure'];
        }

        // Http only
        if (!empty($this->_options['cookie']['httponly'])) {
            $options['httponly'] = (bool) $this->_options['cookie']['httponly'];
        }

        return $options;
    }
}
