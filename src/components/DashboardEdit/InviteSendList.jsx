import { useCallback, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import useBooleanState from '../../hooks/useBooleanState';
import { useGetRequest, useMutationRequest } from '../../hooks/useRequest';
import ListTable, { DeleteButton } from '../common/ListTable';
import BaseModal from '../common/Modal';
import PaginationArrow from '../common/PaginationArrow';

const INVITE_SEND_LIST = 5;

const InviteSendList = ({ id }) => {
  const [page, setPage] = useState(1);
  const [isModalOpen, openModal, closeModal] = useBooleanState();

  const changePage = useCallback((page) => {
    setPage(page);
  }, []);

  const column = [
    {
      title: '이메일',
      dataIndex: 'invitee',
      render: (value) => {
        return <span>{value.email}</span>;
      },
    },
    {
      title: '',
      dataIndex: 'id',
      render: (value) => {
        return (
          <DeleteButton>
            <button
              className="delete_button"
              onClick={() => {
                mutationRequest({ invitationId: value });
              }}
            >
              취소
            </button>
          </DeleteButton>
        );
      },
    },
  ];

  const { data, request } = useGetRequest({
    queryKey: ['dashboards-invite', id],
    requestPath: `/dashboards/${id}/invitations`,
  });

  const {
    request: mutationRequest,
    isSuccess,
    isError,
    error,
  } = useMutationRequest({
    requestPath: `/dashboards/${id}/invitations/:invitationId`,
    queryKey: ['dashboard', 'invitations', 'delete', id],
    method: 'DELETE',
  });

  useEffect(() => {
    request({ page, size: INVITE_SEND_LIST, dashboardId: id });
  }, [page]);

  useEffect(() => {
    if (isSuccess) {
      setPage(1);
      request({ page: 1, size: INVITE_SEND_LIST, dashboardId: id });
    }
    if (isError) {
      alert(error);
    }
  }, [isSuccess, isError]);

  // modal setting
  const [modalInput, setModalInput] = useState('');

  const {
    request: inviteRequest,
    isSuccess: inviteIsSuccess,
    isError: inviteIsError,
    error: inviteError,
  } = useMutationRequest({
    requestPath: `/dashboards/${id}/invitations`,
    queryKey: ['dashboard', 'invitations', id],
    method: 'POST',
  });

  const sendInvite = useCallback(() => {
    if (modalInput === '') {
      alert('이메일을 입력해주세요.');
    } else {
      inviteRequest({ email: modalInput });
    }
  });

  useEffect(() => {
    if (inviteIsSuccess) {
      setPage(1);
      request({ page: 1, size: INVITE_SEND_LIST, dashboardId: id });
      setModalInput('');
      closeModal();
    }
    if (inviteIsError) {
      alert(inviteError?.response?.data?.message ?? '오류가 발생했습니다.');
    }
  }, [inviteIsSuccess, inviteIsError]);

  return (
    <SendListContainer>
      <BaseModal isOpen={isModalOpen}>
        <Container>
          <h1 className="modal_title">초대하기</h1>
          <InputArea>
            <strong>이메일</strong>
            <input onChange={(e) => setModalInput(e.target.value)} />
          </InputArea>
          <ButtonArea>
            <button
              className="cancel_button"
              onClick={() => {
                setModalInput('');
                closeModal();
              }}
            >
              취소
            </button>
            <button className="invite_button" onClick={sendInvite}>
              초대
            </button>
          </ButtonArea>
        </Container>
      </BaseModal>
      <div className="send_header">
        <h1 className="send_title">초대내역</h1>
        <div className="send_invite">
          <PaginationArrow
            page={page}
            size={INVITE_SEND_LIST}
            total={data?.totalCount}
            changePage={changePage}
            showPageInfo={true}
          />
          <button className="invite_button" onClick={openModal}>
            <img src="/src/assets/icon/add_box.svg" />
            <span>초대하기</span>
          </button>
        </div>
      </div>
      <ListTable column={column} data={data?.invitations} nolist={'초대 내역이 없습니다.'} />
    </SendListContainer>
  );
};

export default InviteSendList;

const SendListContainer = styled.article`
  width: 38.75rem;
  height: 29.8125rem;
  flex-shrink: 0;
  border-radius: 0.5rem;
  background: ${({ theme }) => theme.color.white};
  margin-top: 0.75rem;
  .send_header {
    display: flex;
    width: 38.75rem;
    height: 4.12rem;
    padding: 1.62rem 1.75rem 0 1.75rem;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    .send_title {
      color: ${({ theme }) => theme.color.black_33};
      font-size: 1.5rem;
      font-weight: 700;
      line-height: normal;
    }
    .send_invite {
      display: flex;
      align-items: center;
      gap: 1rem;
      .invite_button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 6.5625rem;
        height: 2rem;
        border-radius: 0.25rem;
        background: ${({ theme }) => theme.color.violet};
        color: ${({ theme }) => theme.color.white};
        font-size: 0.8rem;
        font-weight: 500;
      }
    }
  }
`;

const Container = styled.div`
  width: 33.75rem;
  height: 17.25rem;
  background-color: ${({ theme }) => theme.color.white};
  border-radius: 0.5rem;
  padding: 2rem 1.75rem 1.75rem 1.75rem;
  .modal_title {
    color: ${({ theme }) => theme.color.black_33};
    font-family: Pretendard;
    font-size: 1.5rem;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }
`;

const InputArea = styled.div`
  margin-top: 2rem;
  margin-bottom: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.62rem;
  strong {
    color: ${({ theme }) => theme.color.black_33};
    font-family: Pretendard;
    font-size: 1.125rem;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
  }
  input {
    color: ${({ theme }) => theme.color.black_33};
    width: 30.25rem;
    height: 3rem;
    padding: 0 1rem;
    flex-shrink: 0;
    border-radius: 0.375rem;
    border: 1px solid ${({ theme }) => theme.color.gray_D9};
    background: ${({ theme }) => theme.color.white};
    font-size: 1rem;
    font-weight: 400;
    line-height: normal;
  }
`;

const buttonLayout = css`
  display: flex;
  width: 7.5rem;
  height: 3rem;
  justify-content: center;
  align-items: center;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  line-height: normal;
`;
const ButtonArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 0.75rem;
  .cancel_button {
    ${buttonLayout};
    border: 1px solid ${({ theme }) => theme.color.gray_D9};
    background: ${({ theme }) => theme.color.white};
    color: ${({ theme }) => theme.color.gray_78};
  }
  .invite_button {
    ${buttonLayout};
    background: ${({ theme }) => theme.color.violet};
    color: ${({ theme }) => theme.color.white};
  }
`;
