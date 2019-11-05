/**
 * TEAM: frontend_infra
 *
 * @flow
 */

import * as React from "react";
import {css, StyleSheet} from "aphrodite";
import {storiesOf} from "@storybook/react";
import sections from "sections";
import Table from "../../table/Table";
import Button from "../../button/Button";
import data from "../../table/__demo__/data";
import TextCell from "../../table/TextCell";
import InteractableCell from "../../table/InteractableCell";
import Text from "../../Text";
import NotificationModal from "../../modal/NotificationModal";
import NewTable, {withColumnCustomization, withRowSelection, withSorting} from "../../table/NewTable";

const ColumnCustomizationTable = withColumnCustomization(NewTable);
const RowSelectionTable = withRowSelection(NewTable);
const SortingTable = withSorting(NewTable);
const SelectionSortTable = withRowSelection(withSorting(NewTable));

const columnDefinitions = [
  {
    id: "id",
    header: "ID",
    render: row => (
      <TextCell value={row.id} verticalAlign="center" horizontalAlign="start" />
    ),
    width: 50,
    comparator: (a, b) => a.id - b.id,
    aggregateComparator: (as, bs) => as.length - bs.length,
  },
  {
    id: "name",
    header: "Name",
    render: row => (
      <TextCell
        value={row.name}
        verticalAlign="center"
        horizontalAlign="start"
      />
    ),
    width: 150,
    comparator: (a, b) => a.name.localeCompare(b.name),
  },
  {
    id: "email",
    header: "Email",
    render: row => (
      <TextCell
        value={row.email}
        verticalAlign="center"
        horizontalAlign="start"
      />
    ),
    width: 200,
    comparator: (a, b) => a.email.localeCompare(b.email),
  },
  {
    id: "date",
    header: "Date",
    render: row => (
      <TextCell
        value={row.date}
        verticalAlign="center"
        horizontalAlign="start"
      />
    ),
    width: 200,
    comparator: (a, b) => new Date(a.date) - new Date(b.date),
  },
  {
    id: "city",
    header: "City",
    render: row => (
      <TextCell
        value={row.city}
        verticalAlign="center"
        horizontalAlign="start"
      />
    ),
    width: 150,
    comparator: (a, b) => a.city.localeCompare(b.city),
  },
  {
    id: "amount",
    header: "Amount",
    headerAlignment: "right",
    render: row => (
      <TextCell
        value={row.amount}
        verticalAlign="center"
        horizontalAlign="end"
      />
    ),
    width: 70,
    comparator: (a, b) => a.amount - b.amount,
  },
  {
    id: "company",
    header: "Company",
    render: row => (
      <TextCell
        value={row.company}
        verticalAlign="center"
        horizontalAlign="start"
      />
    ),
    width: 100,
  },
  {
    id: "cta",
    header: "",
    render: () => (
      <InteractableCell>
        <Button size="s" onClick={() => {
        }}>
          CTA
        </Button>
      </InteractableCell>
    ),
    width: 75,
  },
];

const BasicTableHoist = () => {
  const [sortBy, setSortBy] = React.useState({
    columnId: "id",
    direction: "asc",
  });

  return (
    <div className={css(styles.container)}>
      <div style={{height: 400, marginBottom: 100}}>
        <Table
          data={data.slice(0, 100)}
          columnDefinitions={columnDefinitions}
          getUniqueRowId={data => data.id}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />
      </div>
      <div style={{height: 400}}>
        <NewTable
          data={data.slice(0, 100)}
          columnDefinitions={columnDefinitions}
          getUniqueRowId={data => data.id}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />
      </div>
    </div>
  );
};

const TableSortHoist = () => {
  const [sortBy, setSortBy] = React.useState({
    columnId: "id",
    direction: "asc",
  });

  return (
    <div className={css(styles.container)}>
      <div style={{height: 400, marginBottom: 100}}>
        <Table
          data={data.slice(0, 100)}
          columnDefinitions={columnDefinitions}
          getUniqueRowId={data => data.id}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />
      </div>
      <div style={{height: 400}}>
        <SortingTable
          data={data.slice(0, 100)}
          columnDefinitions={columnDefinitions}
          getUniqueRowId={data => data.id}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />
      </div>
    </div>
  );
};

const ColumnCustomizationHoist = () => {
  const [hiddenColumns, setHiddenColumns] = React.useState([
    {columnId: "city"},
  ]);
  const [sortBy, setSortBy] = React.useState({
    columnId: "id",
    direction: "asc",
  });
  const pinnedColumns = [
    {
      columnId: "id",
      align: "left",
    },
  ];

  const table = (
    <Table
      data={data.slice(0, 100)}
      columnDefinitions={columnDefinitions}
      getUniqueRowId={data => data.id}
      columnCustomizationEnabled={true}
      hiddenColumns={hiddenColumns}
      onHiddenColumnsChange={setHiddenColumns}
      sortBy={sortBy}
      onSortByChange={setSortBy}
      pinnedColumns={pinnedColumns}
    />
  );
  return (
    <div className={css(styles.container)}>
      <div style={{height: 400, marginBottom: 100}}>
        {table}
      </div>
      <div style={{height: 400, marginBottom: 100}}>
        <ColumnCustomizationTable data={data.slice(0, 100)}
                                  columnDefinitions={columnDefinitions}
                                  getUniqueRowId={data => data.id}
        />
      </div>
    </div>
  );
};

const RowClickingHoist = () => {
  const [clickedRow, setClickedRow] = React.useState(null);
  const [sortBy, setSortBy] = React.useState({
    columnId: "id",
    direction: "asc",
  });

  const table = (
    <Table
      data={data.slice(0, 100)}
      columnDefinitions={columnDefinitions}
      getUniqueRowId={data => data.id}
      sortBy={sortBy}
      onSortByChange={setSortBy}
      rowClickingEnabled={true}
      clickedRow={clickedRow}
      onRowClick={setClickedRow}
    />
  );
  return (
    <div className={css(styles.container)}>
      {table}
      {clickedRow ? (
        <NotificationModal
          title="Clicked Row"
          buttons={[]}
          onRequestClose={() => setClickedRow(null)}
        >
          <Text>You clicked the row with id {clickedRow}</Text>
        </NotificationModal>
      ) : null}
    </div>
  );
};

const RowSelectionHoist = () => {
  const [selectedRows, setSelectedRows] = React.useState(new Set());
  const [newTableSelectedRows, setNewTableSelectedRows] = React.useState(new Set());
  const [selectionSortTableSelectedRows, setSelectionSortTableSelectedRows] = React.useState(new Set());
  const [sortBy, setSortBy] = React.useState({
    columnId: "id",
    direction: "asc",
  });

  const table = (
    <Table
      data={data.slice(0, 100)}
      columnDefinitions={columnDefinitions}
      getUniqueRowId={data => data.id}
      rowSelectionEnabled={true}
      selectedRows={selectedRows}
      onSelectedRowsChange={setSelectedRows}
      sortBy={sortBy}
      onSortByChange={setSortBy}
    />
  );
  const newTable = (
    <RowSelectionTable
      data={data.slice(0, 100)}
      columnDefinitions={columnDefinitions}
      getUniqueRowId={data => data.id}
      onSelectedRowsChange={setNewTableSelectedRows}
    />
  );

  const selectionSortTable = (
    <SelectionSortTable
      data={data.slice(0, 100)}
      columnDefinitions={columnDefinitions}
      getUniqueRowId={data => data.id}
      onSelectedRowsChange={setSelectionSortTableSelectedRows}
    />
  );

  return (
    <div className={css(styles.bigContainer)}>
      <div style={{height: 400, marginBottom: 100}}>
        {table}
        {JSON.stringify(Array.from(selectedRows))}
      </div>
      <div style={{height: 400, marginBottom: 100}}>
        {newTable}
        {JSON.stringify(Array.from(newTableSelectedRows))}
      </div>
      <div style={{height: 400, marginBottom: 100}}>
        {selectionSortTable}
        {JSON.stringify(Array.from(selectionSortTableSelectedRows))}
      </div>
    </div>
  );
};

const RowAggregationHoist = () => {
  const [expandedRows, setExpandedRows] = React.useState(new Set());
  const [sortBy, setSortBy] = React.useState({
    columnId: "id",
    direction: "asc",
  });

  const table = (
    <Table
      data={data.slice(0, 100)}
      columnDefinitions={columnDefinitions}
      getUniqueRowId={row => row.id}
      rowAggregationEnabled={true}
      rowAggregationPinned={false}
      getRowGroupId={row => row.network}
      expandedRows={expandedRows}
      onExpandedRowsChange={setExpandedRows}
      sortBy={sortBy}
      onSortByChange={setSortBy}
    />
  );
  return <div className={css(styles.container)}>{table}</div>;
}

const RowAggregationSelectionHoist = () => {
  const [expandedRows, setExpandedRows] = React.useState(new Set());
  const [selectedRows, setSelectedRows] = React.useState(new Set());

  const [sortBy, setSortBy] = React.useState({
    columnId: "id",
    direction: "asc",
  });

  const table = (
    <Table
      data={data.slice(0, 100)}
      columnDefinitions={columnDefinitions}
      getUniqueRowId={row => row.id}
      rowSelectionEnabled={true}
      selectedRows={selectedRows}
      onSelectedRowsChange={setSelectedRows}
      rowAggregationEnabled={true}
      getRowGroupId={row => row.network}
      expandedRows={expandedRows}
      onExpandedRowsChange={setExpandedRows}
      sortBy={sortBy}
      onSortByChange={setSortBy}
    />
  );
  return <div className={css(styles.container)}>{table}</div>;
}

const PinnedColumnsHoist = () => {
  const [sortBy, setSortBy] = React.useState({
    columnId: "id",
    direction: "asc",
  });

  const table = (
    <Table
      data={data.slice(0, 100)}
      columnDefinitions={columnDefinitions}
      getUniqueRowId={data => data.id}
      pinnedColumns={[
        {columnId: "id", align: "left"},
        {columnId: "name", align: "left"},
        {columnId: "cta", align: "right"},
      ]}
      sortBy={sortBy}
      onSortByChange={setSortBy}
    />
  );
  const newTable = (
    <NewTable
      data={data.slice(0, 100)}
      columnDefinitions={columnDefinitions}
      getUniqueRowId={data => data.id}
      pinnedColumns={[
        {columnId: "id", align: "left"},
        {columnId: "name", align: "left"},
        {columnId: "cta", align: "right"},
      ]}
      sortBy={sortBy}
      onSortByChange={setSortBy}
    />
  );
  return (
    <div className={css(styles.container)}>
      <div style={{height: 400, marginBottom: 100}}>
        {table}
      </div>
      <div style={{height: 400, marginBottom: 100}}>
        {newTable}
      </div>
    </div>
  );
}

const InfiniteLoadHoist = () => {
  const [sortBy, setSortBy] = React.useState({
    columnId: "id",
    direction: "asc",
  });
  const [sliceIndex, setSliceIndex] = React.useState<number>(100);
  const [isLoading, setLoading] = React.useState(false);
  const timeoutRef = React.useRef();
  const handleLoadNextPage = React.useCallback(() => {
    setLoading(true);
    timeoutRef.current = setTimeout(() => {
      setSliceIndex(index => index + 100);
      setLoading(false);
      clearTimeout(timeoutRef.current);
    }, 3000);
  }, [setSliceIndex, setLoading]);
  React.useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  const table = (
    <Table
      data={data.slice(0, sliceIndex)}
      columnDefinitions={columnDefinitions}
      getUniqueRowId={data => data.id}
      sortBy={sortBy}
      onSortByChange={setSortBy}
      hasNextPage={sliceIndex < data.length}
      isNextPageLoading={isLoading}
      loadNextPage={handleLoadNextPage}
    />
  );
  return <div className={css(styles.container)}>{table}</div>;
};

import uuid from "uuid/v4";

function HelloCell({row}: {|+row: string|}) {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("HelloCell mounted");
  }, []);
  // eslint-disable-next-line no-console
  console.log("HelloCell rendered");

  return <div>Hello {row}</div>;
}

const MemoizedHelloCell = React.memo(HelloCell);

const memoizedColumns: $ReadOnlyArray<ColumnDefinition<string>> = [
  {
    id: "helloColumn",
    header: "Hello",
    render: row => <MemoizedHelloCell row={row} />,
    width: 100,
  },
];

const nonMemoizedColumns: $ReadOnlyArray<ColumnDefinition<string>> = [
  {
    id: "helloColumn",
    header: "Hello",
    render: row => <HelloCell row={row} />,
    width: 100,
  },
];

const memoData = ["row 1", "row 2", "row 3"];

function getUniqueRowId(row: string) {
  return row;
}

function RerenderTestTable() {
  const [memoize, setMemoize] = React.useState(false);
  const [, setUselessState] = React.useState(uuid);

  const columns = memoize ? memoizedColumns : nonMemoizedColumns;
  const triggerRerender = React.useCallback(() => {
    setUselessState(uuid());
  }, [setUselessState]);

  return (
    <div>
      <Button onClick={triggerRerender} label="Rerender" />
      <Button
        onClick={() => {
          setMemoize(!memoize);
        }}
        label={`Switch to ${memoize ? "non-memoized" : "memoized"}`}
      />

      <div style={{height: "200px", width: "200px"}}>
        <Table
          columnDefinitions={columns}
          data={memoData}
          getUniqueRowId={getUniqueRowId}
        />
      </div>
    </div>
  );
}

const stories = storiesOf(`${sections.table}/Table`, module);

stories.add("Basic Table", () => <BasicTableHoist />);
stories.add("Sorting Table", () => <TableSortHoist />);
stories.add("Column Customization Table", () => <ColumnCustomizationHoist />);
stories.add("Row Clicking Table", () => <RowClickingHoist />);
stories.add("Row Selection Table", () => <RowSelectionHoist />);
stories.add("Row Aggregation Table", () => <RowAggregationHoist />);
stories.add("Row Aggregation Selection Table", () => <RowAggregationSelectionHoist />);
stories.add("Pinned Columns Table", () => <PinnedColumnsHoist />);
stories.add("Infinite Load Table", () => <InfiniteLoadHoist />);
stories.add("Rerender Test Table", () => <RerenderTestTable />);

const styles = StyleSheet.create({
  container: {width: 900, height: 900},
  bigContainer: {width: 900, height: 1400},
});