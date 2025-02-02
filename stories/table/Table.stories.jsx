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
      <Table
        data={data.slice(0, 100)}
        columnDefinitions={columnDefinitions}
        getUniqueRowId={data => data.id}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />
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
  return <div className={css(styles.container)}>{table}</div>;
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
  return <div className={css(styles.container)}>{table}</div>;
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
  return <div className={css(styles.container)}>{table}</div>;
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

const stories = storiesOf(`${sections.table}/Table`, module);

stories.add("Basic Table", () => <BasicTableHoist />);
stories.add("Column Customization Table", () => <ColumnCustomizationHoist />);
stories.add("Row Clicking Table", () => <RowClickingHoist />);
stories.add("Row Selection Table", () => <RowSelectionHoist />);
stories.add("Row Aggregation Table", () => <RowAggregationHoist />);
stories.add("Row Aggregation Selection Table", () => <RowAggregationSelectionHoist />);
stories.add("Pinned Columns Table", () => <PinnedColumnsHoist />);
stories.add("Infinite Load Table", () => <InfiniteLoadHoist />);

const styles = StyleSheet.create({
  container: {width: 900, height: 600},
});