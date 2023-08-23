const BigIntSerializer: jest.SnapshotSerializerPlugin = {
  test(value: any) {
    return typeof value === 'bigint';
  },

  print(value: bigint) {
    return value.toString() + 'n';
  },
};

export default BigIntSerializer;
