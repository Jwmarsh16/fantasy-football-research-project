import { Fragment, useEffect, useId, useRef, useState } from 'react';
import { Field, Form, Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchPlayers } from '../../redux/slices/playerSlice';
import { addRanking, fetchRankings } from '../../redux/slices/rankingSlice';
import { createRankSchema } from '../../utils/rankValidation';
import { getPersonalRankedPlayers, summarizePlayerRankings } from '../../utils/rankingUtils';

function MyRankings() {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.auth.currentUser?.id);
  const { players, status: playersStatus } = useSelector(state => state.player);
  const { rankings, status: rankingsStatus } = useSelector(state => state.ranking);
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const editButton = useRef(null);
  const editorId = useId();

  useEffect(() => {
    if (editingPlayerId === null) {
      editButton.current?.focus();
      editButton.current = null;
    }
  }, [editingPlayerId]);

  function renderRankEditor(player) {
    const rankId = `${editorId}-rank`;
    return (
      <Formik
        initialValues={{ rank: player.personal_rank }}
        validationSchema={createRankSchema(players.length)}
        onSubmit={async ({ rank }, { setStatus }) => {
          setStatus(undefined);
          try {
            const savedRank = await dispatch(addRanking({ player_id: player.id, rank })).unwrap();
            setSaveMessage(`Your rank for ${player.name} is now ${savedRank.rank}.`);
            setEditingPlayerId(null);
          } catch {
            setStatus('Could not save your ranking. Please try again.');
          }
        }}
      >
        {({ isSubmitting, status, errors, touched }) => {
          const rankError = touched.rank && errors.rank;
          return (
            <Form id={editorId} aria-label={`Edit rank for ${player.name}`} className="rankings-editor" noValidate>
              <label htmlFor={rankId}>Rank for {player.name}</label>
              <div className="rankings-editor-controls">
                <Field
                  type="number"
                  id={rankId}
                  name="rank"
                  className="ffrh-field"
                  autoFocus
                  disabled={isSubmitting}
                  aria-invalid={Boolean(rankError)}
                  aria-describedby={rankError ? `${rankId}-error` : `${rankId}-hint`}
                />
                <button type="submit" className="ffrh-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  className="ffrh-button ffrh-button--secondary"
                  disabled={isSubmitting}
                  onClick={() => setEditingPlayerId(null)}
                >
                  Cancel
                </button>
              </div>
              <p id={`${rankId}-hint`} className="rankings-note">
                Enter a whole number from 1 to {players.length}.
              </p>
              {rankError && <p id={`${rankId}-error`} className="rankings-edit-error" role="alert">{rankError}</p>}
              {status && <p className="rankings-edit-error" role="alert">{status}</p>}
            </Form>
          );
        }}
      </Formik>
    );
  }

  let content;
  if (playersStatus === 'failed' || rankingsStatus === 'failed') {
    content = (
      <div>
        <p role="alert">Could not load your rankings.</p>
        <button type="button" className="ffrh-button ffrh-button--secondary" onClick={() => {
          dispatch(fetchPlayers());
          dispatch(fetchRankings());
        }}>
          Try again
        </button>
      </div>
    );
  } else if (playersStatus !== 'succeeded' || rankingsStatus !== 'succeeded') {
    content = <p role="status">Loading your rankings…</p>;
  } else {
    const rankedPlayers = getPersonalRankedPlayers(summarizePlayerRankings(players, rankings), rankings, userId);
    content = rankedPlayers.length ? (
      <>
        <p className="rankings-note">Community averages include sample rankings.</p>
        <p className="rankings-save-message" role="status">{saveMessage}</p>
        <table className="rankings-table">
          <thead>
            <tr>
              <th scope="col">Player</th>
              <th scope="col">Your rank</th>
              <th scope="col">Community average</th>
            </tr>
          </thead>
          <tbody>
            {rankedPlayers.map(player => {
              const isEditing = player.id === editingPlayerId;
              return (
                <Fragment key={player.id}>
                  <tr>
                    <th scope="row">
                      <Link to={`/players/${player.id}`}>{player.name}</Link>
                      <span className="rankings-player-info">{player.position} · {player.team}</span>
                      <button
                        type="button"
                        className="ffrh-button ffrh-button--secondary rankings-edit-button"
                        aria-label={`Edit rank for ${player.name}`}
                        aria-expanded={isEditing}
                        aria-controls={isEditing ? editorId : undefined}
                        disabled={editingPlayerId !== null}
                        onClick={event => {
                          editButton.current = event.currentTarget;
                          setSaveMessage('');
                          setEditingPlayerId(player.id);
                        }}
                      >
                        Edit rank
                      </button>
                    </th>
                    <td>{player.personal_rank}</td>
                    <td>{player.average_rank?.toFixed(2) ?? '—'}</td>
                  </tr>
                  {isEditing && (
                    <tr>
                      <td colSpan={3} className="rankings-editor-cell">
                        {renderRankEditor(player)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </>
    ) : (
      <p>You haven’t ranked any players yet. <Link to="/players">Browse Players</Link> to save a rank.</p>
    );
  }

  return (
    <section className="rankings-section" aria-labelledby="my-rankings-title">
      <h3 id="my-rankings-title" className="section-title">My Rankings</h3>
      {content}
    </section>
  );
}

export default MyRankings;
