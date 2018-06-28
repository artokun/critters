import React from 'react';
import styled from 'styled-components';
import CritterMain from 'lib/CritterMain';

const critterMain = new CritterMain();

const Main = () => {
  return (
    <main style={{ width: '80%' }}>
      <World grid={critterMain.generateWorld()} />
    </main>
  );
};

const World = ({ grid }) => {
  const renderGrid = () => grid.map(renderRow);
  const renderRow = (row, rowIndex) => (
    <Row key={rowIndex}>{row.map(renderCol)}</Row>
  );
  const renderCol = (col, colIndex) => <Col key={colIndex}>{col}</Col>;
  return (
    <GridWrapper>
      <Grid>{renderGrid()}</Grid>
    </GridWrapper>
  );
};

const GridWrapper = styled.div`
  position: relative;
  height: 0;
  width: 100%;
  padding-top: ${(critterMain.height / critterMain.width) * 100}%;
`;
const Grid = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border: 1px solid #dadada;
`;
const Row = styled.div`
  display: flex;
  flex: 1;
  border-bottom: 1px solid #dadada;

  &:last-child {
    border-bottom: none;
  }
`;
const Col = styled.div`
  flex: 1;
  border-right: 1px solid #dadada;
  font-size: 0;

  &:last-child {
    border-right: none;
  }
`;

export default Main;
