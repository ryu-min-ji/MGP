import React, { useState, useEffect, useRef } from 'react';
import './MyPagePopup.css';
import DiscussionPopup from './DiscussionPopup';

function MyPagePopup({ onClose }) {
  const [activeTab, setActiveTab] = useState('discussions');
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const nickname = sessionStorage.getItem('nickname');
  const popupRef = useRef(null);

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/discussions/my`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setDiscussions(data);
      } catch (error) {
        console.error('토론방 목록 로드 실패:', error);
      }
    };

    fetchDiscussions();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedDiscussion) {
        return;
      }
      
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, selectedDiscussion]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('nickname');
    sessionStorage.removeItem('userId');
    window.location.reload();
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    const now = new Date();
    const diff = now - date;

    // 24시간 이내
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // 일주일 이내
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      return days[date.getDay()] + '요일';
    }
    // 그 외
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="mypage-overlay" onClick={onClose} />
      <div className="mypage-popup" ref={popupRef} onClick={(e) => e.stopPropagation()}>
        <div className="mypage-header">
          <h2>마이페이지</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="mypage-tabs">
          <button
            className={activeTab === 'discussions' ? 'active' : ''}
            onClick={() => setActiveTab('discussions')}
          >
            참여 중인 토론
          </button>
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            프로필
          </button>
        </div>

        <div className="mypage-content">
          {activeTab === 'discussions' ? (
            <div className="discussions-list">
              {discussions.length === 0 ? (
                <div className="no-discussions">
                  참여 중인 토론방이 없습니다.
                </div>
              ) : (
                discussions.map((discussion) => (
                  <div
                    key={discussion.id}
                    className="discussion-item"
                    onClick={() => setSelectedDiscussion(discussion)}
                  >
                    <div className="discussion-info">
                      <h3>{discussion.bill_name}</h3>
                      <p className="last-message">
                        {discussion.last_message}
                      </p>
                    </div>
                    {discussion.last_message_time && (
                      <div className="discussion-time">
                        {formatTime(discussion.last_message_time)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="profile-content">
              <div className="profile-info">
                <p><strong>닉네임:</strong> {nickname}</p>
              </div>
              <button className="logout-button" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedDiscussion && (
        <DiscussionPopup
          discussionId={selectedDiscussion.id}
          billName={selectedDiscussion.bill_name}
          onClose={() => setSelectedDiscussion(null)}
        />
      )}
    </>
  );
}

export default MyPagePopup;
