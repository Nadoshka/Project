import React, { Fragment, useState } from 'react';
//connect Register component to redux.
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
// bring that action in setAlert.
import { setAlert } from '../../actions/alert';
import { register } from '../../actions/auth';
import PropTypes from 'prop-types';

const Register = ({ setAlert, register, isAuthenticated }) => {
  //  state ={formData: { => object has the info of user
  //    name: ..., email: ...
  //  }}
  // setFormData => this.setState({}).
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
  });

  const { name, email, password, password2 } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    // we can access the state from anywhere, we do not have to pass it in as (const password = this.state) because it's available from const { name, email, password, password2 } = formData;
    if (password !== password2) {
      setAlert('passwords do not match!, danger');
    } else {
      register({ name, email, password });
      // an example of making a request post api/user to the backend
      //   const newUser = {
      //     name,
      //     email,
      //     password
      //   };

      //   try {
      //     const config = {
      //       headers: {
      //         'content-Type': 'application/json'
      //       }
      //     };

      //     const body = JSON.stringify(newUser);

      //     const res = await axios.post('/api/users', body, config);
      //     console.log(res.data); // => which is the token
      //   } catch (err) {
      //     console.error(err.response.data);
      //   }
      // }
    }
  };

  if (isAuthenticated) {
    return <Redirect to='/dashboard' />;
  }

  return (
    <Fragment>
      <h1 className='large text-primary'>Sign Up</h1>
      <p className='lead'>
        <i className='fas fa-user'></i> Create Your Account
      </p>
      <form className='form' onSubmit={e => onSubmit(e)}>
        <div className='form-group'>
          <input
            type='text'
            placeholder='Name'
            name='name'
            value={name}
            onChange={e => onChange(e)}
            required
          />
        </div>
        <div className='form-group'>
          <input
            type='email'
            placeholder='Email Address'
            name='email'
            value={email}
            onChange={e => onChange(e)}
            required
          />
          <small className='form-text'>
            This site uses Gravatar so if you want a profile image, use a Gravatar email
          </small>
        </div>
        <div className='form-group'>
          <input
            type='password'
            placeholder='Password'
            name='password'
            value={password}
            onChange={e => onChange(e)}
            minLength='6'
          />
        </div>
        <div className='form-group'>
          <input
            type='password'
            placeholder='Confirm Password'
            name='password2'
            value={password2}
            onChange={e => onChange(e)}
            minLength='6'
          />
        </div>
        <input type='submit' className='btn btn-primary' value='Register' />
      </form>
      <p className='my-1'>
        Already have an account? <Link to='/login'>Sign In</Link>
      </p>
    </Fragment>
  );
};

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
};

//we use the action which we bring it by pass it in to connect. get state from alert will be a first parameter (null),The second is an object with any actions we want to use =(setAlert)
// that allow us to access props dot set alert.

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(
  mapStateToProps,
  { setAlert, register },
)(Register);
