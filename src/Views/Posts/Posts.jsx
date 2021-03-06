import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'semantic-ui-react';
import * as Styles from './Posts.style';
import { Loader, Head } from '../../Components';
import * as actionCreators from '../../store/actions';

const dataPost = require('./data-post.md');
const dataSidePost = require('./data-side-post.md');

// eslint-disable-next-line react/prop-types
const Posts = ({ posts, error, onDataLoad }) => {
  useEffect(() => {
    if (!posts || posts < 1) {
      onDataLoad();
    }
    return console.log('Exiting posts...'); // eslint-disable-line
  }, [onDataLoad, posts]);

  return (
    <>
      <Head title="Posts" />
      <h1>Post Page</h1>
      {posts && posts.length !== 0 ? (
        <List>
          {posts.map((post) => (
            <List.Item key={post.id}>
              <List.Header>{post.title}</List.Header>
              The lovely luck
            </List.Item>
          ))}
        </List>
      ) : (
        <Loader />
      )}
      {error && error.length !== 0 && <h4>{error}</h4>}
      <Styles.Container>
        <Styles.Card>
          <div
            dangerouslySetInnerHTML={{ __html: dataPost.__content }} // eslint-disable-line
          />
        </Styles.Card>
        <Styles.Card>
          <div
            dangerouslySetInnerHTML={{ __html: dataSidePost.__content }} // eslint-disable-line
          />
        </Styles.Card>
      </Styles.Container>
    </>
  );
};

Posts.propTypes = {
  posts: PropTypes.array, // eslint-disable-line
  error: PropTypes.string,
  onDataLoad: PropTypes.func,
};

Posts.defaultProps = {
  posts: [],
  error: '',
  onDataLoad: () => {},
};

const mapStateToProps = ({ posts }) => ({
  posts: posts.list,
  error: posts.error,
});

// onDataLoad lo voy a usar para el CSR
const mapDispatchToProps = (dispatch) => ({
  onDataLoad: () => dispatch(actionCreators.fetchPosts()),
});

// funcion a usar en routes para SSR
function loadDataPosts(store) {
  return store.dispatch(actionCreators.fetchPosts());
}

export { loadDataPosts };

export default connect(mapStateToProps, mapDispatchToProps)(Posts);
