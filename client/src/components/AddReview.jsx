import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useParams } from 'react-router-dom';

function AddReview() {
  const { playerId } = useParams();

  const initialValues = {
    content: '',
    user_id: '',
    player_id: playerId
  };

  const validationSchema = Yup.object({
    content: Yup.string().required('Required')
  });

  const onSubmit = async (values) => {
    const response = await fetch(`http://localhost:5555/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });
    const data = await response.json();
    console.log(data);
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
      <Form>
        <div>
          <label htmlFor="content">Review</label>
          <Field type="text" id="content" name="content" />
          <ErrorMessage name="content" component="div" />
        </div>
        <button type="submit">Add Review</button>
      </Form>
    </Formik>
  );
}

export default AddReview;
