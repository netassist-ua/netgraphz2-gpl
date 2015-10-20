<?php
namespace NetAssist\Forms;
use Phalcon\Forms\Form;
use Phalcon\Forms\Element\Text;
use Phalcon\Forms\Element\Password;
use Phalcon\Forms\Element\Hidden;
use Phalcon\Forms\Element\Submit;
use Phalcon\Forms\Element\Check;
use Phalcon\Validation\Validator\PresenceOf;
use Phalcon\Validation\Validator\Email;
use Phalcon\Validation\Validator\Identical;
use Phalcon\Validation\Validator\StringLength;
use Phalcon\Validation\Validator\Confirmation;


class UserSignupForm extends Form {
	public $email;

	public $emailConfirm;

	public $password;

	public $passwordConfirm;

	public $username;

	public $captcha;

	public function initialize()
	{
		//Username
		$username = new Text('username');
		$username->setLabel("Login");
		$username->addValidators(array(
			new PresenceOf(array(
				'message' => 'The username is required'
			)),
			new StringLength(array(
				'min' => '4',
				'max' => '16',
				'messageMinimum' => 'Login is too short. It should be at least 4 characters long',
				'messageMaximum' => 'Login is too long. It should be maximally 16 characters long'
			))

		));
		$username->setAttributes(array(
			'class' => 'form-control'
		));
		$this->add($username);

		// Email
		$email = new Text('email');
		$email->setLabel('Email address');
		$email->addValidators(array(
			new PresenceOf(array(
				'message' => 'The e-mail is required'
			)),
			new Email(array(
				'message' => 'The e-mail is not valid'
			)),
			new Confirmation(array(
				'message' => 'Email doesn\'t match confirmation',
				'with' => 'confirmEmail'
			))
		));
		$email->setAttributes(array(
			'class' => 'form-control'
		));
		$this->add($email);

		//Confirm Email
		$confirmEmail = new Text('confirmEmail');
		$confirmEmail->setLabel('Repeat Email Address');
		$confirmEmail->addValidators(array(
			new PresenceOf(array(
				'message' => 'The confirmation email is required'
			))
		));
		$confirmEmail->setAttributes(array(
			'class' => 'form-control'
		));
		$this->add($confirmEmail);

		// Password
		$password = new Password('password');
		$password->setLabel('Password');
		$password->addValidators(array(
			new PresenceOf(array(
				'message' => 'The password is required'
			)),
			new StringLength(array(
				'min' => 8,
				'messageMinimum' => 'Password is too short. Minimum 8 characters'
			)),
			new Confirmation(array(
				'message' => 'Password doesn\'t match confirmation',
				'with' => 'confirmPassword'
			))
		));
		$password->setAttributes(array(
			'class' => 'form-control'
		));
		$this->add($password);

		// Confirm Password
		$confirmPassword = new Password('confirmPassword');
		$confirmPassword->setLabel('Repeat Password');
		$confirmPassword->addValidators(array(
			new PresenceOf(array(
				'message' => 'The confirmation password is required'
			))
		));
		$confirmPassword->setAttributes(array(
			'class' => 'form-control'
		));
		$this->add($confirmPassword);

		$csrf = new Hidden('csrf');
		$csrf->addValidator(
					 new Identical([
					 $this->security->checkToken() => 1,
					 'message' => 'This request was aborted because it appears to be forged'
		]));
		$this->add($csrf);

		//Accept agreement
		$terms = new Check('terms', array(
			'value' => 'yes',
			'class' => 'ng-reg-checkbox'
		));
		$terms->setLabel('Accept terms and conditions');
		$terms->addValidator(new Identical(array(
			'value' => 'yes',
			'message' => 'Terms and conditions must be accepted'
		)));
		$this->add($terms);


		//Submit button
		$this->add(new Submit('Register', array(
			'class' => 'btn btn-primary'
		)));

	}

	public function messages($name)
	{
		if ($this->hasMessagesFor($name)) {
			foreach ($this->getMessagesFor($name) as $message) {
				$this->flash->error($message);
			}
		}
	}

}

?>
